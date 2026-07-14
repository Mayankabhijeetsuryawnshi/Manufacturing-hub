import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { db, users, powderStock, productionLogs, dailyChecking, dailyReports, auditLogs, productionSchedules, maintenanceLogs } from "./src/db/index.ts";
import { requireAuth, requireRole, AuthRequest } from "./src/middleware/auth.ts";
import { eq, desc, sql, gte } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS & JSON parsing
  app.use(cors());
  app.use(express.json());

  // PRE-POPULATE default powder stock types if table is empty
  try {
    const existingStock = await db.select().from(powderStock).limit(1);
    if (existingStock.length === 0) {
      const POWDER_TYPES = [
        "Satin Nerolac", "DIKEM Satin Black", "Asian Satin Black", "Matt Black",
        "Manu Grey", "Matt zink primer", "PP New Satin Black", "LD Black (jotun)"
      ];
      console.log("🔋 Pre-populating default powder stock types...");
      for (const type of POWDER_TYPES) {
        await db.insert(powderStock).values({
          powderType: type,
          quantityKg: 200.0, // Default initial stock
          minThreshold: type.toLowerCase().includes("manu grey") || type.toLowerCase().includes("ld black") ? 60.0 : 100.0,
        }).onConflictDoNothing();
      }
      console.log("✅ Default powder stock pre-populated.");
    }
  } catch (err) {
    console.error("⚠️ Error pre-populating powder stock:", err);
  }

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User Profile
  app.get("/api/users/me", requireAuth, (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  // Manage Users (Admin Only)
  app.get("/api/users", requireAuth, requireRole(['Admin']), async (req: AuthRequest, res) => {
    try {
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      res.json(allUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Update User Role (Admin Only)
  app.put("/api/users/:id/role", requireAuth, requireRole(['Admin']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!['Admin', 'Supervisor', 'Worker'].includes(role)) {
        return res.status(400).json({ error: "Invalid role value" });
      }

      const updated = await db.update(users)
        .set({ role })
        .where(eq(users.id, Number(id)))
        .returning();

      // Log action to audits
      await db.insert(auditLogs).values({
        userEmail: req.user?.email,
        action: "UPDATE_ROLE",
        entity: "users",
        details: `Updated user ID ${id} role to ${role}`,
      });

      res.json(updated[0]);
    } catch (error: any) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  // Get Audit Logs (Admin & Supervisor Only)
  app.get("/api/audit-logs", requireAuth, requireRole(['Admin', 'Supervisor']), async (req: AuthRequest, res) => {
    try {
      const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
      res.json(logs);
    } catch (error: any) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Fetch Stats and Inventory Forecasting
  app.get("/api/stats", requireAuth, async (req: AuthRequest, res) => {
    try {
      // 1. Production count
      const totalProdResult = await db.select({
        total: sql<number>`COALESCE(SUM(${productionLogs.qty}), 0)`
      }).from(productionLogs);
      const totalQty = Number(totalProdResult[0]?.total || 0);

      // 2. Powder stock sum
      const totalStockResult = await db.select({
        total: sql<number>`COALESCE(SUM(${powderStock.quantityKg}), 0)`
      }).from(powderStock);
      const totalStock = Number(totalStockResult[0]?.total || 0);

      // 3. Quality Pass Rate (Percentage of Daily Checks that are "OK")
      const totalChecksResult = await db.select({
        count: sql<number>`COUNT(*)`
      }).from(dailyChecking);
      const totalChecks = Number(totalChecksResult[0]?.count || 0);

      const okChecksResult = await db.select({
        count: sql<number>`COUNT(*)`
      }).from(dailyChecking).where(eq(dailyChecking.status, "OK"));
      const okChecks = Number(okChecksResult[0]?.count || 0);

      const qualityPassRate = totalChecks > 0 ? (okChecks / totalChecks) * 100 : 98.4;

      // 4. Calculate Inventory Forecasting based on the last 30 days of production logs
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Sum of powder used by type in the last 30 days
      const usages = await db.select({
        powderType: productionLogs.powderType,
        totalUsed: sql<number>`COALESCE(SUM(${productionLogs.powderUsedKg}), 0)`
      })
      .from(productionLogs)
      .where(gte(productionLogs.createdAt, thirtyDaysAgo))
      .groupBy(productionLogs.powderType);

      const stocks = await db.select().from(powderStock);

      const forecasting = stocks.map(stock => {
        const usageObj = usages.find(u => u.powderType === stock.powderType);
        const totalUsed30Days = usageObj ? Number(usageObj.totalUsed) : 0;
        const avgDailyUsage = totalUsed30Days / 30;

        let daysRemaining = null;
        let forecastStatus = "Sufficient";

        if (avgDailyUsage > 0) {
          daysRemaining = Math.round(stock.quantityKg / avgDailyUsage);
          if (daysRemaining <= 7) {
            forecastStatus = "Critical - Depletion Imminent";
          } else if (daysRemaining <= 15) {
            forecastStatus = "Warning - Low Stock Soon";
          }
        } else if (stock.quantityKg < stock.minThreshold) {
          forecastStatus = "Low Stock";
        }

        return {
          powderType: stock.powderType,
          currentStockKg: stock.quantityKg,
          minThreshold: stock.minThreshold,
          avgDailyUsageKg: Number(avgDailyUsage.toFixed(2)),
          daysRemaining,
          status: forecastStatus
        };
      });

      // 5. Build recent trend
      const recentLogs = await db.select().from(productionLogs).orderBy(desc(productionLogs.createdAt)).limit(5);

      res.json({
        production: totalQty,
        powder: totalStock,
        quality: Number(qualityPassRate.toFixed(1)),
        trends: {
          production: totalQty,
          powder: totalStock,
          quality: Number(qualityPassRate.toFixed(1))
        },
        forecasting,
        recentLogs
      });
    } catch (error: any) {
      console.error("Error gathering stats:", error);
      res.status(500).json({ error: "Failed to load stats" });
    }
  });

  // Get specific historical data
  app.get("/api/production-logs", requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = await db.select().from(productionLogs).orderBy(desc(productionLogs.createdAt)).limit(200);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch production logs" });
    }
  });

  app.get("/api/powder-stock", requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = await db.select().from(powderStock).orderBy(desc(powderStock.lastUpdated));
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch powder stock" });
    }
  });

  app.get("/api/daily-checking", requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = await db.select().from(dailyChecking).orderBy(desc(dailyChecking.createdAt)).limit(100);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch daily checking" });
    }
  });

  app.get("/api/daily-reports", requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = await db.select().from(dailyReports).orderBy(desc(dailyReports.createdAt)).limit(100);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch daily reports" });
    }
  });

  // -------------------------------------------------------------
  // PRODUCTION SCHEDULING ROUTES
  // -------------------------------------------------------------
  app.get("/api/production-schedules", requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = await db.select().from(productionSchedules).orderBy(desc(productionSchedules.createdAt));
      res.json(data);
    } catch (err: any) {
      console.error("Error fetching schedules:", err);
      res.status(500).json({ error: "Failed to fetch production schedules" });
    }
  });

  app.post("/api/production-schedules", requireAuth, requireRole(['Admin', 'Supervisor']), async (req: AuthRequest, res) => {
    try {
      const { customer, partName, qty, targetDate, assignedTo, status } = req.body;
      const inserted = await db.insert(productionSchedules).values({
        customer,
        partName,
        qty: Number(qty) || 0,
        targetDate,
        assignedTo: assignedTo || null,
        status: status || 'Scheduled',
      }).returning();

      await db.insert(auditLogs).values({
        userEmail: req.user?.email,
        action: "CREATE_SCHEDULE",
        entity: "productionSchedules",
        details: `Created schedule: ${customer} - ${partName} (${qty}) by target date ${targetDate}`,
      });

      res.json(inserted[0]);
    } catch (err: any) {
      console.error("Error creating schedule:", err);
      res.status(500).json({ error: "Failed to create schedule" });
    }
  });

  app.put("/api/production-schedules/:id", requireAuth, requireRole(['Admin', 'Supervisor', 'Worker']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { customer, partName, qty, targetDate, assignedTo, status } = req.body;

      const updated = await db.update(productionSchedules)
        .set({
          ...(customer && { customer }),
          ...(partName && { partName }),
          ...(qty !== undefined && { qty: Number(qty) }),
          ...(targetDate && { targetDate }),
          ...(assignedTo !== undefined && { assignedTo }),
          ...(status && { status }),
        })
        .where(eq(productionSchedules.id, Number(id)))
        .returning();

      await db.insert(auditLogs).values({
        userEmail: req.user?.email,
        action: "UPDATE_SCHEDULE",
        entity: "productionSchedules",
        details: `Updated schedule ID ${id} to status: ${status}`,
      });

      res.json(updated[0]);
    } catch (err: any) {
      console.error("Error updating schedule:", err);
      res.status(500).json({ error: "Failed to update schedule" });
    }
  });

  app.delete("/api/production-schedules/:id", requireAuth, requireRole(['Admin', 'Supervisor']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await db.delete(productionSchedules).where(eq(productionSchedules.id, Number(id)));

      await db.insert(auditLogs).values({
        userEmail: req.user?.email,
        action: "DELETE_SCHEDULE",
        entity: "productionSchedules",
        details: `Deleted schedule ID ${id}`,
      });

      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting schedule:", err);
      res.status(500).json({ error: "Failed to delete schedule" });
    }
  });

  // -------------------------------------------------------------
  // MACHINE MAINTENANCE LOGS ROUTES
  // -------------------------------------------------------------
  app.get("/api/maintenance-logs", requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = await db.select().from(maintenanceLogs).orderBy(desc(maintenanceLogs.createdAt));
      res.json(data);
    } catch (err: any) {
      console.error("Error fetching maintenance logs:", err);
      res.status(500).json({ error: "Failed to fetch maintenance logs" });
    }
  });

  app.post("/api/maintenance-logs", requireAuth, requireRole(['Admin', 'Supervisor']), async (req: AuthRequest, res) => {
    try {
      const { machineName, maintenanceType, description, performedBy, status, cost, nextDueDate } = req.body;
      const inserted = await db.insert(maintenanceLogs).values({
        machineName,
        maintenanceType,
        description,
        performedBy: performedBy || null,
        status: status || 'Pending',
        cost: cost !== undefined ? Number(cost) : 0,
        nextDueDate: nextDueDate || null,
      }).returning();

      await db.insert(auditLogs).values({
        userEmail: req.user?.email,
        action: "CREATE_MAINTENANCE",
        entity: "maintenanceLogs",
        details: `Created maintenance log for machine ${machineName} (${maintenanceType})`,
      });

      res.json(inserted[0]);
    } catch (err: any) {
      console.error("Error creating maintenance log:", err);
      res.status(500).json({ error: "Failed to create maintenance log" });
    }
  });

  app.put("/api/maintenance-logs/:id", requireAuth, requireRole(['Admin', 'Supervisor', 'Worker']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { machineName, maintenanceType, description, performedBy, status, cost, nextDueDate } = req.body;

      const updated = await db.update(maintenanceLogs)
        .set({
          ...(machineName && { machineName }),
          ...(maintenanceType && { maintenanceType }),
          ...(description && { description }),
          ...(performedBy !== undefined && { performedBy }),
          ...(status && { status }),
          ...(cost !== undefined && { cost: Number(cost) }),
          ...(nextDueDate !== undefined && { nextDueDate }),
        })
        .where(eq(maintenanceLogs.id, Number(id)))
        .returning();

      await db.insert(auditLogs).values({
        userEmail: req.user?.email,
        action: "UPDATE_MAINTENANCE",
        entity: "maintenanceLogs",
        details: `Updated maintenance log ID ${id} to status: ${status}`,
      });

      res.json(updated[0]);
    } catch (err: any) {
      console.error("Error updating maintenance log:", err);
      res.status(500).json({ error: "Failed to update maintenance log" });
    }
  });

  app.delete("/api/maintenance-logs/:id", requireAuth, requireRole(['Admin', 'Supervisor']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await db.delete(maintenanceLogs).where(eq(maintenanceLogs.id, Number(id)));

      await db.insert(auditLogs).values({
        userEmail: req.user?.email,
        action: "DELETE_MAINTENANCE",
        entity: "maintenanceLogs",
        details: `Deleted maintenance log ID ${id}`,
      });

      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting maintenance log:", err);
      res.status(500).json({ error: "Failed to delete maintenance log" });
    }
  });

  // Consolidated real-time save pipeline
  app.post("/api/save", requireAuth, async (req: AuthRequest, res) => {
    try {
      const payload = req.body;
      const type = payload.type;

      if (type === "productionLog") {
        // Save production log
        const { customer, challanNo, supervisor } = payload;
        const items = payload.parts || payload.rows || [];
        
        const savedRows = [];
        for (const row of items) {
          if (row.qty > 0) {
            const powderTypeVal = row.powderType || "Matt Black";
            const qtyVal = Number(row.qty);
            const rateVal = Number(row.rate) || Number(row.weightPerPart) || 0;
            const amountVal = Number(row.amount) || Number(row.totalWeight) || 0;
            
            // If powderUsed is not specified, let's estimate 0.02 kg (20g) per unit of parts
            const powderUsedKg = Number(row.powderUsed) || Number(row.powderUsedKg) || (qtyVal * 0.02);

            const inserted = await db.insert(productionLogs).values({
              customer,
              challanNo,
              partName: row.name || row.partName,
              qty: qtyVal,
              weightPerPart: rateVal,
              totalWeight: amountVal,
              powderType: powderTypeVal,
              powderUsedKg: powderUsedKg,
              supervisor,
            }).returning();
            savedRows.push(inserted[0]);

            // Real-time Inventory depletion: Subtract powderUsedKg from powderStock table
            if (powderUsedKg > 0) {
              const current = await db.select().from(powderStock).where(eq(powderStock.powderType, powderTypeVal)).then(r => r[0]);
              if (current) {
                const newQty = Math.max(0, current.quantityKg - powderUsedKg);
                await db.update(powderStock)
                  .set({ quantityKg: newQty, lastUpdated: new Date() })
                  .where(eq(powderStock.id, current.id));
              } else {
                // If powder doesn't exist, create it
                await db.insert(powderStock).values({
                  powderType: powderTypeVal,
                  quantityKg: Math.max(0, 100 - powderUsedKg),
                  minThreshold: 40,
                }).onConflictDoNothing();
              }
            }
          }
        }

        // Log to Audits
        await db.insert(auditLogs).values({
          userEmail: req.user?.email,
          action: "SAVE_PRODUCTION_LOG",
          entity: "productionLogs",
          details: `Created production log for customer ${customer} (Challan ${challanNo}) containing ${items.length} row(s).`,
        });

        return res.json({ status: "success", savedRows });

      } else if (type === "powderStock") {
        // Update/set stock quantities
        const { powderRows } = payload;

        for (const row of powderRows) {
          const inStock = Number(row.inStock) || 0;
          await db.insert(powderStock)
            .values({
              powderType: row.name,
              quantityKg: inStock,
              lastUpdated: new Date()
            })
            .onConflictDoUpdate({
              target: powderStock.powderType,
              set: {
                quantityKg: inStock,
                lastUpdated: new Date()
              }
            });
        }

        // Log to Audits
        await db.insert(auditLogs).values({
          userEmail: req.user?.email,
          action: "UPDATE_POWDER_STOCK",
          entity: "powderStock",
          details: `Updated powder stock inventory values.`,
        });

        return res.json({ status: "success" });

      } else if (type === "dailyChecking") {
        // Save parameters checks
        const { checks, supervisor } = payload;
        // checks is array of { parameter, status, value, photoBase64 }
        for (const check of checks) {
          await db.insert(dailyChecking).values({
            parameter: check.parameter,
            value: check.value || "OK",
            status: check.status || "OK",
            supervisor,
            photoBase64: check.photoBase64 || null,
          });
        }

        // Log to Audits
        await db.insert(auditLogs).values({
          userEmail: req.user?.email,
          action: "SAVE_DAILY_CHECKING",
          entity: "dailyChecking",
          details: `Saved daily parameter checking checks.`,
        });

        return res.json({ status: "success" });

      } else if (type === "dailyReport") {
        // Save daily report
        const { date, shift, supervisor, manpower, totalTarget, totalActual, teaBreakRemarks, generalRemarks } = payload;
        
        await db.insert(dailyReports).values({
          date,
          shift,
          supervisor,
          manpower: Number(manpower) || 0,
          totalTarget: Number(totalTarget) || 0,
          totalActual: Number(totalActual) || 0,
          teaBreakRemarks,
          generalRemarks,
        });

        // Log to Audits
        await db.insert(auditLogs).values({
          userEmail: req.user?.email,
          action: "SAVE_DAILY_REPORT",
          entity: "dailyReports",
          details: `Created daily report for shift ${shift} on ${date}.`,
        });

        return res.json({ status: "success" });
      }

      res.status(400).json({ error: "Unknown payload type" });
    } catch (error: any) {
      console.error("Save pipeline failure:", error);
      res.status(500).json({ error: "Failed to save data on server: " + error.message });
    }
  });

  // -------------------------------------------------------------
  // VITE DEV SERVER OR STATIC SERVING
  // -------------------------------------------------------------

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
