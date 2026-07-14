# 🏭 Manufacturing Hub

<div align="center">

### Industrial Production Management Platform

*A modern manufacturing operations platform for production tracking, inventory management, quality control, automated reporting, and operational visibility.*

---

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react\&logoColor=white)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript\&logoColor=white)]()
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js\&logoColor=white)]()
[![Express](https://img.shields.io/badge/Express-000000?logo=express)]()
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase\&logoColor=black)]()
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?logo=googlesheets\&logoColor=white)]()
[![Telegram](https://img.shields.io/badge/Telegram-26A5E4?logo=telegram\&logoColor=white)]()
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare\&logoColor=white)]()

---

### 🌐 Live Demo

**Coming Soon**

### 📖 Documentation

Documentation is available inside the **/docs** directory.

</div>

---

# Overview

Manufacturing Hub is a centralized production management platform designed to simplify and digitize day-to-day manufacturing operations.

Originally developed for deployment within a real manufacturing environment, the platform replaces fragmented workflows involving paper records, spreadsheets, and manual communication with a unified digital workspace.

The application enables production teams to manage manufacturing activities, monitor inventory, record daily operations, automate reporting, and maintain operational visibility across the production floor.

Rather than functioning as a generic inventory application, Manufacturing Hub is structured around actual manufacturing workflows, allowing production data to move seamlessly between operators, supervisors, and management.

---

# Why Manufacturing Hub?

Manufacturing environments often depend on multiple disconnected systems:

* Paper production logs
* Spreadsheet-based reporting
* Manual stock tracking
* Messaging applications
* Individual operator records

As production volume increases, these disconnected workflows become increasingly difficult to manage and audit.

Manufacturing Hub centralizes these operations into a single platform where production, inventory, reporting, quality assurance, and communication operate together through one interface.

The objective is simple:

> **Capture operational data once. Make it available everywhere it is needed.**

---

# Key Features

## 🏭 Production Management

Manage production activities through structured digital workflows.

* Production logging
* Daily production reports
* Batch tracking
* Shift management
* Production history
* Operator records
* Operational statistics

---

## 📦 Inventory Management

Maintain complete visibility of production materials.

* Material inventory
* Powder stock management
* Stock availability
* Consumption tracking
* Inventory history
* Low stock monitoring

---

## ✅ Quality Assurance

Digitize production quality verification.

* Daily inspections
* Production validation
* Quality checkpoints
* Inspection records
* Compliance tracking

---

## 📊 Reporting

Generate operational reports automatically.

* Daily reports
* Production summaries
* Inventory reports
* Historical records
* Export-ready datasets

---

## 🔔 Automation

Reduce repetitive administrative work.

* Telegram notifications
* Google Sheets synchronization
* Automated operational updates
* Event-driven reporting

---

## 🔐 User Management

Secure access to production information.

* Authentication
* Session management
* Protected routes
* Administrative controls

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

---

## Backend

* Node.js
* Express
* Firebase
* Drizzle ORM

---

## Integrations

* Google Sheets API
* Telegram Bot API
* Firebase Authentication
* Firebase Storage

---

## Deployment

* Cloudflare Pages
* Express Server

---

# Screenshots

> Screenshots will be added here.

```
Dashboard

Production

Inventory

Quality

Reports

Settings
```

---

# Architecture Overview

```
                    Operators
                        │
                        ▼

               Manufacturing Hub
                        │
 ┌──────────────────────┼──────────────────────┐
 │                      │                      │
 ▼                      ▼                      ▼

Production          Inventory             Quality

 │                      │                      │
 └──────────────┬───────┴──────────────┬───────┘
                ▼                      ▼

          Reporting Engine      Notification Service

                │                      │
                ▼                      ▼

         Google Sheets         Telegram Bot

                │
                ▼

         Factory Management
```

The complete architecture is documented in:

**docs/ARCHITECTURE.md**

---

# Repository Structure

```text
Manufacturing-Hub/

├── client/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── assets/
│   └── lib/
│
├── server/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── database/
│
├── shared/
│
├── docs/
│
├── public/
│
└── README.md
```

---

# Quick Start

## Clone Repository

```bash
git clone https://github.com/yourusername/Manufacturing-Hub.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

Create a `.env` file using the provided template.

Configure:

* Firebase
* Google Sheets
* Telegram Bot
* Database
* Authentication

---

## Run Development Server

```bash
npm run dev
```

---

## Build Production Version

```bash
npm run build
```

---

# Documentation

Detailed technical documentation is available inside the **docs** directory.

| Document           | Description            |
| ------------------ | ---------------------- |
| ARCHITECTURE.md    | System architecture    |
| FEATURES.md        | Feature documentation  |
| SYSTEM_OVERVIEW.md | Platform overview      |
| WORKFLOW.md        | Manufacturing workflow |
| DATABASE.md        | Database structure     |
| API.md             | API reference          |
| SECURITY.md        | Security architecture  |
| DEPLOYMENT.md      | Deployment guide       |
| PERFORMANCE.md     | Optimization details   |
| ROADMAP.md         | Future development     |

---

# Design Philosophy

Manufacturing Hub is designed around one principle:

> **Operational software should reduce administrative effort without increasing operational complexity.**

Every module exists to improve workflow efficiency, data accuracy, and production visibility.

The interface prioritizes clarity over decoration, ensuring that production information remains accessible, predictable, and actionable throughout the manufacturing process.

---

# Project Status

Current development includes:

* Production Management
* Inventory Tracking
* Daily Reporting
* Authentication
* Telegram Integration
* Google Sheets Synchronization

Future development will focus on analytics, machine monitoring, reporting enhancements, and operational intelligence.

---

# Roadmap Preview

* Machine Monitoring
* Production Analytics
* Barcode & QR Support
* Maintenance Scheduling
* Downtime Tracking
* PDF Reports
* Multi-factory Support
* Advanced Inventory Forecasting
* Audit Logs
* Mobile Application

See **docs/ROADMAP.md** for the complete roadmap.

---

# Author

## Mayank Abhijeet Suryawanshi

Electronics & Telecommunication Student

Full Stack Developer

Industrial Software Enthusiast

---
---

# Platform Architecture

Manufacturing Hub follows a modular client-server architecture where each subsystem is responsible for a single operational domain. Production activities, inventory records, quality inspections, reporting, and communication services operate independently while sharing a centralized data model.

The application is designed to scale by extending existing modules rather than replacing them. New production lines, warehouses, reporting systems, or third-party integrations can be introduced without affecting existing workflows.

```
                        Client Application
                               │
                               ▼
                     React + TypeScript UI
                               │
                               ▼
                       Express Application
                               │
        ┌──────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
   Production      Inventory      Reports      Authentication
        │              │              │              │
        └──────────────┴───────┬──────┴──────────────┘
                               ▼
                          Database Layer
                               │
          ┌────────────────────┴────────────────────┐
          ▼                                         ▼
  Google Sheets                          Telegram Notifications
```

Every subsystem performs a clearly defined responsibility, allowing maintenance and future expansion without tightly coupling unrelated components.

---

# Operational Workflow

Manufacturing Hub mirrors the daily workflow of a production facility.

Rather than forcing users to adapt to software, the software follows the manufacturing process already used inside the factory.

```
Material Received
        │
        ▼
Inventory Registration
        │
        ▼
Production Assignment
        │
        ▼
Operator Execution
        │
        ▼
Production Logging
        │
        ▼
Quality Verification
        │
        ▼
Daily Reporting
        │
        ▼
Management Review
```

Each step generates structured operational data that becomes immediately available across the platform.

---

# Production Module

The Production Module serves as the operational core of Manufacturing Hub.

Its responsibility is to capture every production event digitally while maintaining a complete operational history.

Primary responsibilities include:

* Recording production activity
* Tracking completed batches
* Managing operator assignments
* Recording production quantities
* Maintaining historical records
* Generating production statistics

Instead of relying on handwritten production books, all operational activity is stored digitally and becomes searchable.

---

# Inventory Module

Inventory management focuses on maintaining visibility of production materials throughout the manufacturing cycle.

The module tracks:

* Raw materials
* Powder stock
* Material movement
* Available quantities
* Consumption history
* Remaining inventory

Future versions will introduce inventory forecasting and automatic stock alerts based on production trends.

---

# Quality Management

Every manufacturing process requires quality verification.

The Quality Module records inspection activities performed during production.

Current responsibilities include:

* Daily inspection records
* Production validation
* Quality observations
* Inspection history

Future versions may include:

* Defect categorization
* Digital quality checklists
* Image-based inspection records
* Statistical Process Control (SPC)

---

# Reporting System

Operational reporting should require minimal manual effort.

Manufacturing Hub automatically transforms production data into structured reports suitable for supervisors and management.

Current reports include:

* Daily production
* Production summaries
* Inventory status
* Historical records

Future reporting capabilities include:

* Monthly analytics
* Efficiency calculations
* Production forecasting
* Machine utilization
* Downtime analysis

---

# Notification Engine

Manufacturing Hub includes an event-driven notification system.

Rather than requiring users to manually communicate production updates, important operational events can automatically generate notifications.

Supported notification events include:

* Production completed
* Daily reports generated
* Inventory updates
* Operational alerts

Notification delivery currently supports:

* Telegram

Future support may include:

* Email
* WhatsApp Business
* Microsoft Teams
* Slack

---

# Google Sheets Synchronization

Google Sheets acts as an external reporting layer.

Operational data can be synchronized automatically, allowing management to access production information without opening the application.

Typical synchronization includes:

* Production reports
* Daily summaries
* Inventory updates
* Operational statistics

This approach provides compatibility with existing spreadsheet-based reporting workflows while reducing duplicate data entry.

---

# Authentication

Manufacturing Hub protects operational data through authenticated user access.

Authentication responsibilities include:

* Secure login
* Session management
* Protected application routes
* Administrative access

Future improvements:

* Multi-role permissions
* Supervisor accounts
* Operator accounts
* Read-only management dashboards
* Activity auditing

---

# Design Principles

Manufacturing Hub follows several engineering principles.

## Single Responsibility

Each module performs one operational function.

Production should not manage inventory.

Inventory should not generate reports.

Reports should not manage authentication.

Keeping responsibilities isolated simplifies maintenance.

---

## Modular Development

Every feature is designed as an independent module.

Examples include:

* Production
* Inventory
* Quality
* Reports
* Notifications

Additional modules can be integrated without redesigning the application.

---

## Operational Simplicity

Factory software should never become more complicated than the production process itself.

Interfaces are designed to reduce user effort rather than increase it.

The objective is not to expose every possible feature.

The objective is to make common production tasks efficient.

---

## Reliability

Production software must remain predictable.

Manufacturing Hub emphasizes:

* consistent navigation
* structured workflows
* stable interfaces
* repeatable operations
* clear system feedback

The application favors reliability over visual complexity.

---

# System Integrations

Manufacturing Hub communicates with several external services.

## Firebase

Provides:

* Authentication
* Cloud services
* Data storage

---

## Telegram Bot

Provides:

* Automated operational notifications
* Production updates
* Report delivery

---

## Google Sheets

Provides:

* External reporting
* Spreadsheet compatibility
* Operational summaries
* Historical record sharing

---

# Performance Goals

The platform is optimized for daily operational use.

Design objectives include:

* Fast page loading
* Minimal user interaction
* Low operational latency
* Responsive interface
* Stable data synchronization

Future optimization plans include:

* Request caching
* Lazy loading
* Incremental rendering
* Background synchronization
* Offline support

---

# Security Overview

Operational manufacturing data represents business-critical information.

Manufacturing Hub incorporates several layers of protection.

Current protections include:

* User authentication
* Protected routes
* Environment-based configuration
* Secure API communication

Future security improvements include:

* Role-based permissions
* Audit logging
* API rate limiting
* Backup automation
* Session expiration policies
* Multi-factor authentication

---

# Scalability

Manufacturing Hub has been designed with future expansion in mind.

Planned capabilities include:

* Multiple factories
* Multiple warehouses
* Multiple production lines
* Department-specific dashboards
* Cross-site reporting
* IoT device integration
* Machine telemetry
* Predictive maintenance
* ERP connectivity

The architecture intentionally separates operational modules to simplify future growth without requiring major structural changes.

---

# Deployment

Manufacturing Hub is designed to support both development and production environments with minimal configuration.

## Prerequisites

Before deployment, ensure the following services are configured:

* Node.js 20+
* npm
* Firebase Project
* Google Cloud Project
* Google Sheets API
* Telegram Bot Token

---

## Installation

Clone the repository.

```bash
git clone https://github.com/Mayankabhijeetsuryawnshi/Manufacturing-Hub.git
```

Navigate into the project.

```bash
cd Manufacturing-Hub
```

Install dependencies.

```bash
npm install
```

---

## Environment Configuration

Create a `.env` file from `.env.example`.

Typical configuration includes:

```text
Firebase Configuration

Database Configuration

Google Sheets Credentials

Telegram Bot Token

Application URL

Authentication Secrets
```

Never commit production secrets to version control.

---

## Development

Start the development server.

```bash
npm run dev
```

The application will launch with hot module replacement enabled.

---

## Production Build

Generate an optimized production build.

```bash
npm run build
```

Preview the production build locally.

```bash
npm run preview
```

---

## Deployment Targets

Manufacturing Hub is compatible with:

* Cloudflare Pages
* Firebase Hosting
* Vercel
* Netlify
* Docker
* Traditional VPS deployments

Backend services can be deployed independently using Node.js or containerized infrastructure.

---

# Development Workflow

Feature development follows a modular approach.

```
Planning

↓

Development

↓

Testing

↓

Review

↓

Deployment

↓

Monitoring
```

Every module should remain independent and maintain a single responsibility.

---

# Coding Standards

Manufacturing Hub follows a consistent development philosophy.

## Naming

Use descriptive names.

Good:

```
ProductionReport

InventoryService

NotificationManager
```

Avoid:

```
Data

Manager1

Helper

Stuff

Temp
```

---

## Components

Each component should solve one problem.

Avoid large components responsible for multiple workflows.

Keep presentation, business logic, and data access separated whenever possible.

---

## Folder Organization

Organize files by responsibility rather than file type.

Example:

```
Production

├── components

├── hooks

├── services

├── utils

└── types
```

---

## Code Style

Preferred characteristics:

* Readable
* Modular
* Reusable
* Predictable
* Strongly typed
* Well documented

The project favors maintainability over clever implementations.

---

# Project Goals

Manufacturing Hub is guided by several long-term engineering objectives.

## Reliability

The application should behave consistently under daily production workloads.

---

## Simplicity

Interfaces should reduce operational effort instead of increasing it.

---

## Maintainability

Future contributors should understand the system quickly through clear architecture and documentation.

---

## Scalability

The platform should support additional production lines, factories, warehouses, and integrations without significant architectural changes.

---

# Documentation

Complete documentation is located inside the `/docs` directory.

```
docs/

ARCHITECTURE.md

FEATURES.md

SYSTEM_OVERVIEW.md

WORKFLOW.md

DATABASE.md

API.md

SECURITY.md

DEPLOYMENT.md

PERFORMANCE.md

ROADMAP.md

CHANGELOG.md

CONTRIBUTING.md
```

Each document focuses on a specific aspect of the system to keep information organized and maintainable.

---

# Contributing

Contributions are welcome.

To contribute:

1. Fork the repository.

2. Create a feature branch.

```
feature/new-module
```

3. Commit changes using meaningful commit messages.

Example:

```
Add inventory forecasting

Improve production reporting

Optimize Telegram notifications
```

4. Open a Pull Request.

Please ensure all contributions maintain the project's architectural and coding standards.

---

# Versioning

Manufacturing Hub follows Semantic Versioning.

Example:

```
v1.0.0

Major.Minor.Patch
```

Example progression:

```
v1.0.0

Initial Release

↓

v1.1.0

Reporting Improvements

↓

v1.2.0

Inventory Analytics

↓

v2.0.0

Machine Monitoring
```

---

# Changelog

Major milestones include:

### v1.0

* Production Management
* Inventory Tracking
* Daily Reporting
* Authentication
* Google Sheets Integration
* Telegram Notifications

Future releases will continue expanding manufacturing workflows and operational analytics.

---

# Roadmap

### Short Term

* Dashboard Improvements
* Advanced Reporting
* Search & Filtering
* Performance Optimizations
* Better Mobile Support

---

### Medium Term

* Machine Monitoring
* Maintenance Scheduling
* Barcode & QR Scanning
* PDF Reports
* User Roles
* Audit Logs

---

### Long Term

* Multi-factory Management
* Predictive Analytics
* IoT Integration
* ERP Connectivity
* Production Forecasting
* Advanced Inventory Planning
* Real-time Operational Dashboards

---

# Frequently Asked Questions

## Is Manufacturing Hub production-ready?

The project is actively developed and has been designed around real manufacturing workflows. Features continue to evolve as additional operational requirements are identified.

---

## Can it support multiple factories?

Multi-factory support is planned as part of the long-term roadmap.

---

## Does it work offline?

Offline synchronization is planned for a future release.

---

## Which databases are supported?

The architecture is designed to remain database-independent, allowing future expansion beyond the current implementation.

---

## Can additional integrations be added?

Yes.

The modular service architecture allows new communication, reporting, and enterprise integrations to be introduced without redesigning the core application.

---

# License

This project is licensed under the MIT License.

See the LICENSE file for complete details.

---

# Acknowledgements

Manufacturing Hub was inspired by practical manufacturing workflows and the need to simplify production management through software.

The project was originally developed for deployment within a real manufacturing environment, where daily operational requirements shaped the design and feature set.

Every module exists to solve a practical operational problem rather than demonstrate a technical concept.

---

# About the Author

## Mayank Abhijeet Suryawanshi

Electronics & Telecommunication Student

Full Stack Developer

Industrial Software Enthusiast

Interested in Manufacturing Systems, Embedded Software, Industrial Automation, Artificial Intelligence, and Human-Centered Engineering.

GitHub:

https://github.com/Mayankabhijeetsuryawnshi

---

# Final Thoughts

Manufacturing Hub represents an ongoing effort to modernize manufacturing operations through practical software engineering.

Rather than replacing existing operational knowledge, the platform enhances it by providing structured workflows, centralized data management, and automated communication.

As the project evolves, the focus will remain unchanged:

* Reduce manual work.
* Improve operational visibility.
* Increase data reliability.
* Build software that supports real manufacturing environments.

---

<div align="center">

### Built with engineering discipline for modern manufacturing operations.

**If this project is useful to you, consider giving it a ⭐ on GitHub.**

</div>
