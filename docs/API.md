# API Reference

> **Version:** 1.0
>
> **Project:** Manufacturing Hub
>
> **Document Type:** REST API Specification

---

# 1. Introduction

The Manufacturing Hub API provides a secure interface between the client application and the operational database.

Rather than allowing direct database access, every production activity, inventory update, quality inspection, report, and administrative action is processed through the REST API.

The API is designed around manufacturing workflows and follows consistent architectural principles that prioritize security, predictability, and maintainability.

---

# 2. API Design Philosophy

The API follows several engineering principles.

## Resource-Oriented Design

Each endpoint represents a business resource rather than a database operation.

Examples include:

* Users
* Production Logs
* Powder Stock
* Daily Reports
* Audit Logs
* Maintenance Logs
* Production Schedules

This organization keeps the API intuitive while aligning it with real manufacturing processes.

---

## Authentication First

Every operational endpoint requires authentication unless explicitly marked as public.

Authentication is validated before business logic executes.

```text
Request

    │

    ▼

Authentication

    │

    ▼

Authorization

    │

    ▼

Business Logic

    │

    ▼

Database

    │

    ▼

Response
```

---

## Role-Based Authorization

Access permissions are enforced using middleware.

Current supported roles include:

| Role           | Description                          |
| -------------- | ------------------------------------ |
| **Admin**      | Full platform administration         |
| **Supervisor** | Production supervision and reporting |
| **Worker**     | Operational manufacturing activities |

Every endpoint validates permissions before accessing protected resources.

---

# 3. API Architecture

The Manufacturing Hub API follows a layered architecture.

```text
React Frontend

        │

HTTP Requests

        │

        ▼

Express Server

        │

────────┼────────

│              │

▼              ▼

Authentication

Authorization

        │

        ▼

Business Logic

        │

        ▼

Drizzle ORM

        │

        ▼

PostgreSQL
```

Each layer has a single responsibility, improving maintainability and reducing coupling.

---

# 4. Base URL

During local development:

```http
http://localhost:3000/api
```

Example production deployment:

```http
https://manufacturing-hub.example.com/api
```

All endpoints described in this document are relative to the `/api` path.

---

# 5. Authentication

Protected endpoints require authentication using the application's authentication middleware.

```typescript
requireAuth
```

The middleware:

* verifies user identity
* loads the authenticated user
* attaches user information to the request
* rejects unauthorized requests

Example:

```http
GET /api/users/me
```

Only authenticated users can access this endpoint.

---

# 6. Authorization

Some endpoints require elevated permissions.

Authorization is enforced using:

```typescript
requireRole(...)
```

Example:

```typescript
requireRole(["Admin"])
```

or

```typescript
requireRole(["Admin", "Supervisor"])
```

This keeps authorization centralized and consistent across the application.

---

# 7. Response Format

Successful responses return JSON.

Example:

```json
{
  "status": "ok"
}
```

or

```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "Admin"
  }
}
```

Error responses follow the same structure.

```json
{
  "error": "Failed to fetch users"
}
```

Using consistent response structures simplifies frontend integration.

---

# 8. Public Endpoints

## Health Check

```http
GET /api/health
```

Returns server availability information.

### Authentication

Not Required

### Response

```json
{
  "status": "ok",
  "timestamp": "2026-07-14T12:34:56Z"
}
```

This endpoint is intended for deployment monitoring and infrastructure health checks.

---

# 9. User Endpoints

## Get Current User

```http
GET /api/users/me
```

Returns information about the authenticated user.

### Authentication

Required

### Authorization

Any authenticated user

### Response

```json
{
  "user": {
    "...": "..."
  }
}
```

---

## Get All Users

```http
GET /api/users
```

Returns every registered user ordered by creation date.

### Authentication

Required

### Authorization

Admin Only

### Success Response

```json
[
  {
    "id": 1,
    "email": "...",
    "role": "Admin"
  }
]
```

### Error Responses

```http
401 Unauthorized
```

```http
403 Forbidden
```

```http
500 Internal Server Error
```

---

## Update User Role

```http
PUT /api/users/:id/role
```

Updates the role assigned to a user account.

### Authentication

Required

### Authorization

Admin Only

### Request Body

```json
{
  "role": "Supervisor"
}
```

Accepted values:

* Admin
* Supervisor
* Worker

If an invalid role is supplied, the API returns:

```http
400 Bad Request
```

Every successful role change automatically generates an audit log entry to preserve administrative history.

---

# 10. Audit Log Endpoints

## Retrieve Audit Logs

```http
GET /api/audit-logs
```

Returns recent operational audit events.

### Authentication

Required

### Authorization

Admin

Supervisor

### Default Ordering

Newest First

### Default Limit

100 Records

Audit records provide traceability for important administrative operations such as permission changes and other sensitive actions.

---

# 11. Statistics Endpoint

## Operational Statistics

```http
GET /api/stats
```

Provides aggregated operational statistics used throughout dashboards and reporting views.

Current calculations include:

* Total production quantity
* Inventory metrics
* Forecasting calculations
* Operational summaries

Future versions may extend this endpoint with:

* Monthly production
* Machine utilization
* Downtime analysis
* Quality statistics
* Inventory trends

---

# 12. Production Management Endpoints

Production management forms the operational core of Manufacturing Hub. These endpoints manage the creation, retrieval, modification, and analysis of manufacturing records.

Every production request passes through authentication, input validation, business logic, and database persistence before becoming part of the operational history.

---

## Retrieve Production Logs

```http
GET /api/production-logs
```

Returns production records ordered by the most recent manufacturing activity.

### Authentication

Required

### Authorization

* Admin
* Supervisor
* Worker

### Response

```json
[
  {
    "id": 1,
    "customer": "ABC Industries",
    "partName": "Housing Plate",
    "quantity": 500,
    "powderType": "RAL 9005",
    "createdAt": "2026-07-14T10:30:00Z"
  }
]
```

---

## Create Production Log

```http
POST /api/production-logs
```

Creates a new production record after validating operational information.

### Authentication

Required

### Authorization

* Admin
* Supervisor

### Example Request

```json
{
  "customer": "ABC Industries",
  "challanNumber": "CH-2026-041",
  "partName": "Bracket",
  "quantity": 800,
  "weightPerPart": 0.42,
  "powderType": "RAL 9005",
  "supervisor": "John Doe"
}
```

### Success Response

```http
201 Created
```

---

## Update Production Log

```http
PUT /api/production-logs/:id
```

Updates an existing production record while preserving operational consistency.

---

## Delete Production Log

```http
DELETE /api/production-logs/:id
```

Deletes a production record.

This operation should generally be restricted to administrative users to preserve production history.

---

# 13. Inventory Endpoints

Inventory endpoints manage powder stock and material availability throughout the manufacturing process.

---

## Retrieve Powder Inventory

```http
GET /api/powder-stock
```

Returns the current inventory of coating powders.

Example Response

```json
[
  {
    "powderType": "RAL 9005",
    "quantity": 250,
    "minimumThreshold": 50
  }
]
```

---

## Add Inventory

```http
POST /api/powder-stock
```

Registers new powder inventory.

Example Request

```json
{
  "powderType": "RAL 7035",
  "quantity": 100
}
```

---

## Update Inventory

```http
PUT /api/powder-stock/:id
```

Updates inventory quantities after stock adjustments or corrections.

---

## Delete Inventory Item

```http
DELETE /api/powder-stock/:id
```

Removes an inventory record.

Administrative permissions are recommended.

---

## Inventory Forecast

```http
GET /api/powder-stock/forecast
```

Returns inventory projections calculated from current stock levels and historical consumption.

Future versions may incorporate seasonal demand and production schedules into forecasting calculations.

---

# 14. Quality Inspection Endpoints

Quality inspections verify production output before manufacturing records are finalized.

---

## Retrieve Inspection Records

```http
GET /api/daily-checking
```

Returns inspection history.

---

## Record Inspection

```http
POST /api/daily-checking
```

Creates a new quality inspection record.

Example Request

```json
{
  "parameter": "Film Thickness",
  "value": "82 μm",
  "status": "Pass"
}
```

---

## Update Inspection

```http
PUT /api/daily-checking/:id
```

Updates an existing inspection record.

---

## Delete Inspection

```http
DELETE /api/daily-checking/:id
```

Removes an inspection record when administrative correction is required.

---

# 15. Daily Reports API

Daily reports summarize manufacturing activity for operational review.

---

## Retrieve Reports

```http
GET /api/daily-reports
```

Returns previously generated daily reports.

---

## Create Report

```http
POST /api/daily-reports
```

Generates a new operational report.

Generated reports may include:

* Production summary
* Inventory status
* Inspection overview
* Shift statistics

---

## Update Report

```http
PUT /api/daily-reports/:id
```

Updates report metadata where permitted.

---

# 16. Production Scheduling API

Scheduling endpoints organize planned manufacturing activities.

---

## Retrieve Schedule

```http
GET /api/production-schedules
```

Returns scheduled production activities.

---

## Create Schedule

```http
POST /api/production-schedules
```

Registers a future production schedule.

Example Request

```json
{
  "customer": "ABC Industries",
  "scheduledDate": "2026-08-01",
  "quantity": 1200
}
```

---

## Modify Schedule

```http
PUT /api/production-schedules/:id
```

Updates production planning information.

---

## Remove Schedule

```http
DELETE /api/production-schedules/:id
```

Deletes a scheduled production activity.

---

# 17. Maintenance API

Maintenance endpoints record equipment servicing and maintenance history.

---

## Retrieve Maintenance Logs

```http
GET /api/maintenance-logs
```

Returns historical maintenance activities.

---

## Create Maintenance Record

```http
POST /api/maintenance-logs
```

Registers maintenance work performed on manufacturing equipment.

Example Request

```json
{
  "machine": "Powder Booth 2",
  "activity": "Filter Replacement",
  "technician": "Maintenance Team"
}
```

---

## Update Maintenance Record

```http
PUT /api/maintenance-logs/:id
```

Updates maintenance information.

---

## Delete Maintenance Record

```http
DELETE /api/maintenance-logs/:id
```

Removes an existing maintenance record.

---

. Request Processing Pipeline

Every API request follows the same lifecycle.

```text
HTTP Request

      │

      ▼

Express Router

      │

      ▼

Authentication

      │

      ▼

Authorization

      │

      ▼

Input Validation

      │

      ▼

Business Logic

      │

      ▼

Drizzle ORM

      │

      ▼

PostgreSQL

      │

      ▼

JSON Response
```

This standardized processing pipeline ensures consistent behavior across all API endpoints while simplifying maintenance and debugging.

---

. HTTP Status Codes

Manufacturing Hub follows standard HTTP status codes to communicate the outcome of API requests. Consistent responses simplify frontend development and improve debugging.

| Status Code                   | Description                             | Typical Usage                        |
| ----------------------------- | --------------------------------------- | ------------------------------------ |
| **200 OK**                    | Request completed successfully          | Data retrieval                       |
| **201 Created**               | Resource created successfully           | New production log, inventory record |
| **204 No Content**            | Request succeeded without response body | Delete operations                    |
| **400 Bad Request**           | Invalid request payload                 | Missing required fields              |
| **401 Unauthorized**          | Authentication required                 | Missing or invalid credentials       |
| **403 Forbidden**             | User lacks permission                   | Role restriction                     |
| **404 Not Found**             | Requested resource does not exist       | Invalid record ID                    |
| **409 Conflict**              | Duplicate or conflicting data           | Existing unique record               |
| **500 Internal Server Error** | Unexpected server error                 | Database or application failure      |

The API maintains consistent status codes across every module, allowing the client application to implement predictable error handling.

---

. Error Handling

Errors are returned in a structured JSON format to simplify frontend integration.

## Standard Error Response

```json id="n0h6d5"
{
  "error": "Production log not found"
}
```

Errors are intentionally concise and avoid exposing internal implementation details.

Typical validation failures include:

* Missing required fields
* Invalid identifiers
* Invalid role assignment
* Duplicate inventory entries
* Unauthorized access
* Invalid request format

Server-side exceptions are logged internally while returning generic error messages to clients.

---

# 18. Audit & Logging

Operational traceability is a core requirement of Manufacturing Hub.

Administrative and sensitive operations generate audit records that can be reviewed by authorized personnel.

Examples include:

* User role changes
* Administrative actions
* Authentication events
* Configuration changes
* Future security events

Audit logs provide accountability while supporting troubleshooting and compliance requirements.

---

# 19. Security Considerations

The API is designed around the principle of **least privilege**.

Every request passes through authentication before business logic is executed.

Protected endpoints additionally verify user permissions through role-based authorization.

```text id="2z4n9q"
Client Request
      │
      ▼
Authentication
      │
      ▼
Role Verification
      │
      ▼
Business Logic
      │
      ▼
Database
      │
      ▼
Response
```

Sensitive operations remain inaccessible to users without the required authorization level.

Future security improvements may include:

* Multi-factor authentication
* Token expiration
* Refresh tokens
* API rate limiting
* Request signing
* Audit alerts
* IP-based restrictions

---

# 20. API Versioning Strategy

Although the current API operates under a single version, future releases should adopt explicit versioning.

Recommended structure:

```http id="r2l5k8"
GET /api/v1/production
```

Future breaking changes would be introduced under a new version.

```http id="w3s8xm"
GET /api/v2/production
```

Versioning allows existing client applications to continue functioning while newer implementations adopt expanded capabilities.

---

# 21. Performance Considerations

The API is optimized for operational responsiveness rather than isolated benchmark performance.

Current architectural practices include:

* Lightweight JSON responses
* Server-side validation
* Efficient database access through Drizzle ORM
* Centralized business logic
* Middleware reuse

Future optimizations may include:

* Pagination
* Response compression
* Query optimization
* Database indexing
* Intelligent caching
* Background processing for long-running tasks

These improvements can be introduced without altering the external API contract.

---

# 22. Future API Expansion

As Manufacturing Hub evolves, additional endpoints may support more advanced manufacturing operations.

Potential future resources include:

```text id="t9f6ae"
Machines

Production Lines

Departments

Suppliers

Customers

Purchase Orders

Warehouse Operations

Machine Telemetry

Quality Defects

Predictive Analytics
```

Example future endpoint hierarchy:

```text id="h7j3pv"
/api/v1

├── authentication
├── users
├── production
├── inventory
├── quality
├── reports
├── maintenance
├── scheduling
├── machines
├── suppliers
├── warehouses
└── analytics
```

The current architecture has been designed so these resources can be introduced without disrupting existing endpoints.

---

# 23. API Design Principles

Future development should preserve the architectural principles established by the initial implementation.

## Consistency

Endpoints should follow predictable naming conventions and response formats.

---

## Resource Orientation

API resources should represent real manufacturing entities rather than implementation details.

---

## Security by Default

Authentication and authorization should remain mandatory for protected resources.

---

## Maintainability

Business logic should remain centralized rather than duplicated across endpoints.

---

## Extensibility

New capabilities should extend the API without introducing unnecessary breaking changes.

---

# 24. Conclusion

The Manufacturing Hub REST API provides a secure and structured interface between the client application and the operational database.

Its architecture separates authentication, authorization, business logic, and persistence into clearly defined layers, improving maintainability while supporting long-term scalability.

By organizing endpoints around manufacturing workflows instead of database operations, the API remains intuitive for developers while accurately reflecting the operational domains of the platform.

As Manufacturing Hub continues to evolve, the API will expand to support additional manufacturing capabilities—including machine monitoring, warehouse management, industrial IoT integration, predictive analytics, and enterprise interoperability—while preserving the principles of consistency, security, and reliability established in this specification.

---

<div align="center">

## End of REST API Specification

**Project:** Manufacturing Hub

**Document:** API.md

**Version:** 1.0

*"A well-designed API does more than expose data—it defines a stable contract between software systems and the operational processes they support."*

</div>
