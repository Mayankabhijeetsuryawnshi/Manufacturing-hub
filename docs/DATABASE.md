# Database Design & Data Model

> **Version:** 1.0
>
> **Project:** Manufacturing Hub
>
> **Document Type:** Database Architecture Specification

---

# 1. Introduction

The Manufacturing Hub database serves as the central repository for all operational information generated throughout the manufacturing process.

Every production activity, inventory update, quality inspection, maintenance record, user account, operational report, and audit event ultimately becomes structured information stored within the database.

Rather than functioning solely as persistent storage, the database acts as the operational memory of the platform, preserving both current manufacturing activity and historical operational records.

The schema has been designed around real manufacturing workflows, ensuring that every table represents a meaningful business entity instead of simply supporting application screens.

---

# 2. Database Philosophy

The database architecture follows several engineering principles.

## Operational First

Tables represent real manufacturing activities.

Examples include:

* Production Logs
* Powder Inventory
* Daily Reports
* Maintenance Logs
* Production Schedules

This allows developers and manufacturing personnel to understand the schema without translating software terminology into business concepts.

---

## Single Source of Truth

Operational information should exist only once.

For example:

A completed production batch should not require duplicate records for reporting.

Instead, reporting modules retrieve information directly from validated production data.

This reduces inconsistencies while simplifying long-term maintenance.

---

## Modular Growth

Each operational area owns its own table.

Examples:

```text
Users

↓

Production Logs

↓

Powder Stock

↓

Quality Checking

↓

Daily Reports

↓

Maintenance

↓

Audit Logs
```

Future manufacturing capabilities can therefore introduce additional tables without restructuring existing data.

---

# 3. Database Architecture

Manufacturing Hub uses a relational PostgreSQL database accessed through **Drizzle ORM**.

The ORM provides:

* Type-safe database operations
* Schema version control
* Relationship mapping
* Compile-time validation
* Simplified migrations

This approach combines the flexibility of PostgreSQL with strongly typed application development.

---

## High-Level Database Structure

```text
                        Manufacturing Hub Database

                                │

 ┌────────────┬───────────────┬──────────────┬──────────────┐

 ▼            ▼               ▼              ▼

Users    Production      Inventory      Quality

 │            │               │              │

 ├────────────┼───────────────┼──────────────┤

 ▼            ▼               ▼              ▼

Reports   Scheduling    Maintenance    Audit Logs
```

Each table corresponds to a distinct operational responsibility while remaining connected through shared business workflows.

---

# 4. Core Database Entities

The current schema consists of the following primary entities.

| Table                    | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| **users**                | Application users authenticated through Firebase |
| **powder_stock**         | Inventory management for coating powders         |
| **production_logs**      | Daily manufacturing records                      |
| **daily_checking**       | Quality inspection parameters                    |
| **daily_reports**        | Shift and production summaries                   |
| **production_schedules** | Planned manufacturing activities                 |
| **maintenance_logs**     | Machine maintenance history                      |
| **audit_logs**           | Security and activity tracking                   |

Each entity represents a distinct operational domain within Manufacturing Hub.

---

# 5. Entity Overview

## Users

The **users** table stores application users synchronized with Firebase Authentication.

Responsibilities include:

* User identity
* Email address
* Display name
* Operational role
* Account creation timestamp

### Primary Key

```text
id
```

### Unique Fields

```text
uid
```

The Firebase UID serves as the permanent external identity for authenticated users.

Roles currently include:

* Admin
* Supervisor
* Worker

Future releases may introduce additional operational roles without changing the overall authentication architecture.

---

## Powder Stock

The **powder_stock** table manages available powder inventory.

Each record represents a specific powder type currently available within the manufacturing facility.

### Stored Information

* Powder type
* Current quantity
* Minimum threshold
* Last update timestamp

### Primary Key

```text
id
```

### Unique Constraint

```text
powder_type
```

Because every powder type must be uniquely identifiable, duplicate inventory records are prevented through database constraints.

The minimum threshold allows future inventory monitoring features to automatically identify low-stock conditions.

---

## Production Logs

The **production_logs** table represents the operational core of Manufacturing Hub.

Every completed production activity generates one production log.

### Stored Information

* Customer
* Challan Number
* Part Name
* Quantity
* Weight Per Part
* Total Weight
* Powder Type
* Powder Consumption
* Supervisor
* Creation Timestamp

Each record captures both production output and material consumption, allowing operational reporting and inventory analysis to reference the same dataset.

The production log functions as the primary historical record of manufacturing activity.

---

## Daily Checking

The **daily_checking** table stores operational quality inspection parameters.

Unlike production records, these entries describe inspection outcomes rather than manufacturing output.

Stored information includes:

* Inspection parameter
* Recorded value
* Status
* Supervisor
* Photo evidence
* Timestamp

The optional image attachment provides visual documentation for quality inspections when required.

Future versions may replace Base64 image storage with dedicated object storage while preserving the same logical workflow.

---

# 6. Daily Reports

The **daily_reports** table consolidates operational information into structured summaries that provide supervisors and management with a clear overview of manufacturing performance for a given reporting period.

Unlike `production_logs`, which capture individual manufacturing events, the `daily_reports` table represents aggregated operational outcomes.

---

## Purpose

The table is responsible for preserving high-level production summaries that support:

* Daily production review
* Shift analysis
* Historical reporting
* Management decision-making
* Operational trend analysis

Rather than recalculating reports every time they are requested, finalized reports can be stored as permanent operational records.

---

## Stored Information

Typical report information includes:

* Report date
* Production totals
* Operational summary
* Supervisor remarks
* Generated timestamp

Future versions may include:

* Machine utilization
* Material efficiency
* Downtime statistics
* Production targets
* Shift comparisons

---

## Primary Key

```text
id
```

Each report represents one finalized operational summary.

---

# 7. Production Scheduling

The **production_schedules** table manages planned manufacturing activities before production begins.

While `production_logs` describe completed work, production schedules define future operational tasks.

---

## Purpose

Scheduling enables supervisors to organize production before execution.

Typical scheduling information includes:

* Customer
* Product
* Planned quantity
* Scheduled production date
* Assigned supervisor
* Status

---

## Operational Workflow

```text
Production Request

        │

        ▼

Schedule Created

        │

        ▼

Supervisor Review

        │

        ▼

Production Begins

        │

        ▼

Production Log Created
```

Separating planning from execution provides greater operational flexibility while preserving a complete production history.

---

## Benefits

The scheduling system enables:

* Better production planning
* Reduced scheduling conflicts
* Improved workload balancing
* Future capacity forecasting

---

# 8. Maintenance Logs

Manufacturing equipment requires routine servicing to ensure operational reliability.

The **maintenance_logs** table records maintenance activities performed throughout the equipment lifecycle.

---

## Purpose

Maintenance records preserve information about:

* Equipment servicing
* Repair history
* Inspection activities
* Operational downtime
* Maintenance scheduling

Rather than treating maintenance as isolated events, the platform maintains a complete historical record.

---

## Stored Information

Maintenance records include information such as:

* Machine or equipment name
* Maintenance description
* Maintenance status
* Assigned technician
* Scheduled date
* Completion date
* Additional notes

---

## Operational Benefits

Historical maintenance information supports:

* Preventive maintenance
* Equipment reliability analysis
* Downtime reduction
* Long-term asset management

Future analytics modules may combine maintenance history with production performance to identify reliability trends.

---

# 9. Audit Logs

The **audit_logs** table provides accountability throughout the platform.

Every significant system action can be recorded to create a permanent history of operational activity.

---

## Purpose

Audit logs improve:

* Security
* Traceability
* Compliance
* Operational transparency

Rather than relying on user memory, important actions become permanent system records.

---

## Recorded Events

Examples include:

* User login
* Record creation
* Record modification
* Record deletion
* Administrative changes
* Configuration updates

---

## Stored Information

Typical audit records contain:

* User identifier
* Action performed
* Target resource
* Timestamp
* Additional metadata

Audit information should remain immutable once recorded.

This ensures historical accuracy during future operational reviews.

---

# 10. Table Relationships

Although Manufacturing Hub maintains independent operational modules, the database is designed around connected business workflows.

A simplified entity relationship diagram is shown below.

```text
                    Users
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼

Production      Daily Checking   Audit Logs
      │
      │
      ▼

Daily Reports

      │

      ▼

Production Schedules

      │

      ▼

Maintenance Logs

Inventory (Powder Stock)
      ▲
      │
Production Consumption
```

Not every relationship is enforced through direct foreign keys.

Some relationships remain logical rather than structural because they represent operational workflows instead of strict database dependencies.

This approach provides flexibility while maintaining clear business relationships.

---

# 11. Data Integrity

Reliable manufacturing software depends upon accurate operational information.

Manufacturing Hub incorporates several mechanisms to preserve data integrity.

---

## Primary Keys

Every operational table contains a unique identifier.

This guarantees that every record remains uniquely identifiable throughout its lifecycle.

---

## Unique Constraints

Where appropriate, duplicate operational information is prevented.

Examples include:

* Firebase UID
* Powder Type

These constraints eliminate ambiguity while simplifying future reporting.

---

## Required Fields

Critical operational information cannot be omitted.

Required fields ensure incomplete production records cannot enter the database.

This improves reporting quality while reducing downstream validation.

---

## Timestamp Tracking

Nearly every operational table records creation or update timestamps.

These timestamps support:

* Historical analysis
* Audit investigations
* Report generation
* Operational timelines
* Future analytics

Maintaining consistent timestamps across the schema provides a complete chronological history of manufacturing activities.

---

# 12. Data Integrity Strategy

Manufacturing Hub places a strong emphasis on maintaining accurate, consistent, and traceable operational data.

Every record stored within the database contributes to historical reporting, production analysis, inventory tracking, or operational auditing. Maintaining data integrity is therefore essential to the reliability of the platform.

The database enforces integrity through several complementary mechanisms.

---

## Primary Keys

Every table contains a unique primary key.

```text
users
    └── id

powder_stock
    └── id

production_logs
    └── id

daily_checking
    └── id

daily_reports
    └── id

production_schedules
    └── id

maintenance_logs
    └── id

audit_logs
    └── id
```

Primary keys ensure every operational record remains uniquely identifiable throughout its lifecycle.

---

## Unique Constraints

Certain business entities must never exist more than once.

For example:

```text
users.uid

powder_stock.powder_type
```

These constraints prevent duplicate user identities and duplicate inventory records for the same powder type.

---

## Timestamp Consistency

Every operational table records creation time.

This provides:

* Historical traceability
* Operational auditing
* Report generation
* Chronological sorting
* Future analytics

Maintaining consistent timestamps across entities simplifies both application logic and reporting.

---

## Validation Layers

Operational information is validated before permanent storage.

Validation occurs in multiple stages:

```text
User Input

      │

      ▼

Frontend Validation

      │

      ▼

API Validation

      │

      ▼

Business Rules

      │

      ▼

Database Storage
```

This layered approach prevents incomplete or inconsistent information from entering the operational database.

---

# 13. Relationships Between Entities

Although each table serves an independent responsibility, they collectively describe a single manufacturing process.

The logical relationships can be represented as follows.

```text
Users

 │

 ├───────────────┐

 ▼               ▼

Production    Daily Checking

 │               │

 ▼               ▼

Daily Reports  Maintenance

 │

 ▼

Audit Logs
```

Inventory information supports production activities, while production records contribute to reporting and operational history.

Rather than tightly coupling tables through complex dependencies, the schema favors clear operational boundaries.

This simplifies maintenance while preserving logical consistency.

---

# 14. Data Lifecycle

Every piece of operational information follows a structured lifecycle.

## Production Example

```text
Operator

     │

     ▼

Production Entry

     │

     ▼

Validation

     │

     ▼

Production Log

     │

     ▼

Daily Report

     │

     ▼

Historical Archive
```

The same production record supports multiple downstream activities without requiring duplicate storage.

---

## Inventory Example

```text
Material Received

       │

       ▼

Powder Stock

       │

       ▼

Production Consumption

       │

       ▼

Updated Inventory

       │

       ▼

Operational Reports
```

Inventory information continuously evolves while preserving an accurate view of current stock levels.

---

## Maintenance Example

```text
Equipment Issue

       │

       ▼

Maintenance Log

       │

       ▼

Repair Activity

       │

       ▼

Maintenance History
```

Maintenance records provide a permanent operational history for future analysis and preventive planning.

---

# 15. Indexing Strategy

As Manufacturing Hub grows, efficient querying becomes increasingly important.

Current indexing primarily relies on primary keys and unique constraints provided by PostgreSQL.

Future optimization may introduce indexes for frequently queried fields such as:

* Customer Name
* Challan Number
* Powder Type
* Supervisor
* Production Date
* Schedule Date
* Maintenance Status

Appropriate indexing reduces query execution time while improving dashboard responsiveness and report generation.

---

# 16. Backup & Recovery Strategy

Manufacturing data represents valuable business information.

Future deployments should implement automated backup procedures.

Recommended practices include:

* Daily database backups
* Incremental backups
* Off-site backup storage
* Backup verification
* Recovery testing

These practices reduce the risk of data loss while supporting business continuity.

---

# 17. Future Schema Evolution

The current schema provides a strong operational foundation while remaining intentionally extensible.

Potential future entities include:

```text
Machines

Departments

Warehouses

Purchase Orders

Suppliers

Customers

Products

Production Lines

Work Orders

Machine Telemetry

Inventory Transactions

Quality Defects
```

These additions can be incorporated without restructuring the existing schema because current tables are organized around independent business domains.

---

## Possible Future Relationships

```text
Customers

     │

     ▼

Orders

     │

     ▼

Production

     │

     ▼

Inventory

     │

     ▼

Dispatch

     │

     ▼

Invoices
```

Similarly:

```text
Machines

     │

     ▼

Machine Sensors

     │

     ▼

Telemetry

     │

     ▼

Maintenance

     │

     ▼

Predictive Analytics
```

These extensions align with the platform's long-term objective of supporting increasingly sophisticated manufacturing operations.

---

# 18. Database Design Principles

Every future modification to the schema should follow the principles established during the initial design.

## Represent Business Entities

Tables should describe real operational concepts rather than user interface elements.

---

## Avoid Redundant Information

Operational information should be stored once and referenced wherever possible.

Duplicate storage increases maintenance complexity and introduces opportunities for inconsistency.

---

## Preserve Historical Records

Manufacturing history should remain available for reporting, auditing, and operational analysis.

Records should be retained rather than overwritten whenever practical.

---

## Design for Growth

New operational capabilities should extend the schema without disrupting existing data structures.

Backward compatibility simplifies upgrades and minimizes migration effort.

---

# 19. Conclusion

The Manufacturing Hub database is more than a storage layer—it is the operational backbone of the platform.

Its schema has been organized around real manufacturing workflows, allowing production records, inventory management, quality inspections, scheduling, maintenance activities, reporting, and auditing to coexist within a unified relational model.

By emphasizing modularity, consistency, and data integrity, the database provides a reliable foundation for both current manufacturing operations and future platform expansion.

As the project evolves, new entities and relationships will build upon this foundation while preserving the principles of clarity, maintainability, and operational reliability established in the initial design.

---

<div align="center">

## End of Database Architecture Specification

**Project:** Manufacturing Hub

**Document:** DATABASE.md

**Version:** 1.0

*"A well-designed database does more than store information—it preserves the operational history that drives better decisions."*

</div>

