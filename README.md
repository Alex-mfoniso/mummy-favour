# Divine Favour — Industrial Nylon Packaging Platform

A modern platform for **Divine Favour**, a nylon manufacturing and packaging business serving individual customers, retailers, wholesalers, and commercial buyers.

Tagline: *"Quality Packaging. Reliable Supply."*

---

## Project Structure

This repository contains both the public storefront/admin frontend and the dedicated Node.js backend.

```
.
├── src/                  # React + Vite + TypeScript + Tailwind CSS Frontend
├── public/               # Public assets and favicon
├── server/               # Node.js + Express + TypeScript + PostgreSQL + Prisma Backend
│   ├── prisma/           # Prisma schema & PostgreSQL migrations
│   ├── src/              # Backend application code (app, server, routes, config, lib, middleware)
│   ├── tests/            # Backend Vitest automated test suite
│   └── README.md         # Dedicated backend documentation
├── dist/                 # Compiled frontend bundle
├── package.json          # Frontend dependencies & scripts
└── README.md             # Project overview
```

---

## Quick Start (Local Development)

### 1. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start Vite dev server on http://localhost:5173
npm run dev

# Build frontend for production
npm run build
```

### 2. Backend Setup
```bash
cd server

# Install backend dependencies
npm install

# Copy environment template and configure DATABASE_URL
cp .env.example .env

# Run Prisma database migrations (requires local PostgreSQL)
npm run prisma:migrate

# Run tests
npm test

# Start backend dev server on http://localhost:5000
npm run dev

# Build backend for production
npm run build
```

---

## Current Status (Phase 7 Complete)

- **Frontend (Phases 1–6)**:
  - Homepage, Product Catalogue, and Product Detail Pages.
  - Quote Request and Custom Packaging Enquiry Flows.
  - About and Contact Pages with verified channels.
  - Comprehensive Admin Dashboard UI (`/admin`).
- **Backend Foundation (Phase 7)**:
  - Express + TypeScript application architecture in `server/`.
  - PostgreSQL schema and version-controlled Prisma migrations.
  - Entities: `Product`, `Category`, `Enquiry`, `BusinessSettings`, `AdminUser`.
  - Robust health (`/api/v1/health`) and database readiness (`/api/v1/health/ready`) probes.
  - Centralized error handling, Zod environment validation, and security headers.
  - 100% passing automated test suite with Vitest.
