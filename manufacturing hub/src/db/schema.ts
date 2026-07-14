import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, real } from 'drizzle-orm/pg-core';

// Define the 'users' table linked to Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('Worker'), // 'Admin', 'Supervisor', 'Worker'
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'powder_stock' (inventory) table
export const powderStock = pgTable('powder_stock', {
  id: serial('id').primaryKey(),
  powderType: text('powder_type').notNull().unique(),
  quantityKg: real('quantity_kg').notNull().default(0),
  minThreshold: real('min_threshold').notNull().default(50.0),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

// Define the 'production_logs' table
export const productionLogs = pgTable('production_logs', {
  id: serial('id').primaryKey(),
  customer: text('customer').notNull(),
  challanNo: text('challan_no').notNull(),
  partName: text('part_name').notNull(),
  qty: integer('qty').notNull(),
  weightPerPart: real('weight_per_part'),
  totalWeight: real('total_weight'),
  powderType: text('powder_type'),
  powderUsedKg: real('powder_used_kg'),
  supervisor: text('supervisor'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'daily_checking' parameters table
export const dailyChecking = pgTable('daily_checking', {
  id: serial('id').primaryKey(),
  parameter: text('parameter').notNull(),
  value: text('value').notNull(),
  status: text('status').notNull(), // 'OK', 'Critical', 'Warning'
  supervisor: text('supervisor'),
  photoBase64: text('photo_base64'), // Photo attachment for Quality Control
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'daily_reports' table
export const dailyReports = pgTable('daily_reports', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(), // YYYY-MM-DD
  shift: text('shift').notNull(),
  supervisor: text('supervisor'),
  manpower: integer('manpower'),
  totalTarget: integer('total_target'),
  totalActual: integer('total_actual'),
  teaBreakRemarks: text('tea_break_remarks'),
  generalRemarks: text('general_remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'production_schedules' table
export const productionSchedules = pgTable('production_schedules', {
  id: serial('id').primaryKey(),
  customer: text('customer').notNull(),
  partName: text('part_name').notNull(),
  qty: integer('qty').notNull(),
  targetDate: text('target_date').notNull(), // YYYY-MM-DD
  assignedTo: text('assigned_to'),
  status: text('status').notNull().default('Scheduled'), // 'Scheduled', 'In Progress', 'Completed', 'Cancelled'
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'maintenance_logs' table for machine maintenance
export const maintenanceLogs = pgTable('maintenance_logs', {
  id: serial('id').primaryKey(),
  machineName: text('machine_name').notNull(),
  maintenanceType: text('maintenance_type').notNull(), // 'Routine', 'Repair', 'Breakdown', 'Calibration'
  description: text('description').notNull(),
  performedBy: text('performed_by'),
  status: text('status').notNull().default('Pending'), // 'Completed', 'Pending', 'Scheduled'
  cost: real('cost').default(0),
  nextDueDate: text('next_due_date'), // YYYY-MM-DD
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'audit_logs' table for security tracking
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email'),
  action: text('action').notNull(), // e.g., 'ADD_LOG', 'UPDATE_STOCK', 'DELETE_USER'
  entity: text('entity').notNull(), // e.g., 'productionLogs', 'powderStock'
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  auditLogs: many(auditLogs),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userEmail],
    references: [users.email],
  }),
}));
