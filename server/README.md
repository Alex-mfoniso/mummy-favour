# Divine Favour — Backend Architecture & Service Guide

Backend service for the **Divine Favour** nylon packaging platform. Built with Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM.

---

## 1. Architecture Overview

The backend is structured under `server/` with strict separation of HTTP transport, validation, business domain logic, and data access.

```
server/
├── prisma/
│   ├── schema.prisma                  # Prisma ORM schema & entity definitions
│   └── migrations/
│       ├── 20261014144016_init/       # Initial schema & models
│       └── 20261014151031_add_session_model/ # PostgreSQL session table for connect-pg-simple
├── src/
│   ├── app.ts                         # Express application factory & middleware wiring
│   ├── server.ts                      # HTTP runtime entrypoint with graceful shutdown
│   ├── config/
│   │   ├── env.ts                     # Strict Zod environment schema & parser
│   │   └── index.ts                   # Cached configuration singleton
│   ├── controllers/
│   │   ├── auth.controller.ts         # Authentication HTTP handlers (login, logout, me, csrf)
│   │   ├── category.controller.ts     # Category HTTP request handlers
│   │   ├── product.controller.ts      # Product HTTP request handlers
│   │   └── index.ts
│   ├── lib/
│   │   └── prisma.ts                  # Singleton Prisma client & readiness checks
│   ├── middleware/
│   │   ├── auth.ts                    # requireAuth & requireRole RBAC middleware
│   │   ├── csrf.ts                    # Synchronizer token pattern CSRF defense
│   │   ├── errorHandler.ts            # Centralized error handler & JSON parser guard
│   │   ├── notFound.ts                # Standardized 404 handler for unknown routes
│   │   ├── rateLimiter.ts             # Brute-force rate limiter for login
│   │   ├── session.ts                 # PostgreSQL-backed express-session store
│   │   ├── validateRequest.ts         # Zod request validation middleware
│   │   └── index.ts
│   ├── repositories/                  # Data access layer (Prisma queries)
│   │   ├── adminUser.repository.ts
│   │   ├── category.repository.ts
│   │   ├── product.repository.ts
│   │   └── index.ts
│   ├── routes/
│   │   ├── auth.ts                    # Authentication endpoints (/api/v1/auth/*)
│   │   ├── categories.ts              # Category endpoints (/api/v1/categories)
│   │   ├── health.ts                  # Liveness (/health) and readiness (/health/ready)
│   │   ├── products.ts                # Product endpoints (/api/v1/products)
│   │   └── index.ts                   # API v1 route aggregator (/api/v1/*)
│   ├── schemas/                       # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   ├── category.schema.ts
│   │   ├── product.schema.ts
│   │   └── index.ts
│   ├── scripts/
│   │   ├── provisionAdmin.ts          # Safe administrator provisioning CLI
│   │   └── seed.ts                    # Idempotent database seed script
│   ├── services/                      # Domain business logic
│   │   ├── auth.service.ts
│   │   ├── category.service.ts
│   │   ├── password.service.ts        # Argon2id password hashing & dummy verification
│   │   ├── product.service.ts
│   │   └── index.ts
│   └── types/
│       ├── api.ts                     # API response contracts (success, error, meta)
│       ├── session.d.ts               # Augmented express-session and SafeAdminUser types
│       └── index.ts
├── tests/
│   ├── adminGuard.test.ts             # Administrative route protection & boundary tests
│   ├── app.test.ts                    # Error handling, 404, bad JSON tests
│   ├── auth.test.ts                   # Comprehensive auth, session, CSRF, and RBAC tests
│   ├── categories.test.ts             # Categories API CRUD and conflict tests
│   ├── env.test.ts                    # Zod environment validation & session secret tests
│   ├── health.test.ts                 # Health & readiness (mocked DB) tests
│   ├── prisma.test.ts                 # Prisma model contract tests
│   └── products.test.ts               # Products API filtering, sorting, CRUD tests
├── .env.example                       # Non-sensitive configuration template
├── package.json                       # Backend scripts & dependencies
├── tsconfig.json                      # Server TypeScript configuration
└── vitest.config.ts                   # Vitest unit & integration test configuration
```

---

## 2. Prerequisites

- **Node.js**: `v20.0.0` or higher (tested on `v22.16.0`)
- **PostgreSQL**: `15+` (tested on `PostgreSQL 18`)
- **npm**: `10+`

---

## 3. Environment Configuration

Copy the example configuration file to create your local `.env`:

```bash
cd server
cp .env.example .env
```

Key environment configuration variables:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Local HTTP port | `5000` |
| `NODE_ENV` | Runtime environment (`development`, `test`, `production`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:<password>@localhost:5432/divine_favour_dev?schema=public` |
| `CORS_ORIGIN` | Whitelisted frontend origins (comma-separated) | `http://localhost:5173,http://localhost:3000` |
| `SESSION_SECRET` | Secret key for signing session cookies (min 32 chars in production) | `dev-only-secret-key-replace-in-production-min-32-chars-long` |
| `SESSION_MAX_AGE_MS` | Session expiration window in milliseconds | `86400000` (24 hours) |
| `COOKIE_SECURE` | Enforce HTTPS cookies (`true`/`false`) | `false` in development, `true` in production |
| `COOKIE_SAME_SITE` | Cookie SameSite policy (`lax`/`strict`/`none`) | `lax` |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Rate limit window for administrator logins | `900000` (15 minutes) |
| `AUTH_RATE_LIMIT_MAX` | Maximum login attempts per window per IP | `10` |

> [!CAUTION]
> Never commit `.env` or sensitive credentials to version control. Both the root and server `.gitignore` explicitly exclude `.env` files. In `production`, a `SESSION_SECRET` with at least 32 characters is strictly required.

---

## 4. Local Database Setup, Migrations & Provisioning

### 1. Create Database
Ensure PostgreSQL is running locally, then create the development database:

```sql
CREATE DATABASE divine_favour_dev;
```

### 2. Apply Migrations
Apply version-controlled Prisma migrations (including the `session` table for persistent sessions):

```bash
cd server
npm run prisma:migrate
```

### 3. Seed Database
Populate initial categories and manufacturing products:

```bash
npm run db:seed
```

### 4. Provision Initial Administrator
To provision an administrator safely without exposing public registration endpoints:

**Non-interactive (Flags / Arguments):**
```bash
npm run admin:provision -- --name="Divine Admin" --email="admin@divinefavour.com" --password="YourSecurePassword123!" --role="ADMIN"
```

**Interactive (Prompts):**
```bash
npm run admin:provision
```

The script:
- Validates email format and enforces minimum 8 characters for password.
- Hashes password using memory-hard **Argon2id**.
- Prevents accidental overwrites if the email already exists.
- Never prints passwords to logs or terminals.

---

## 5. Security & Authentication Architecture

### 1. Password Hashing (Argon2id)
All administrative credentials are protected with **Argon2id** (`memoryCost: 65536 KB`, `timeCost: 3 iterations`, `parallelism: 4 threads`).
To resist timing side-channel attacks during login attempts, dummy hashes are verified when an email lookup misses or finds an inactive user, keeping execution time indistinguishable.

### 2. Server-Managed Persistent Sessions
- Backed by **PostgreSQL** via `connect-pg-simple` and `express-session`.
- Session cookies (`df_sid`) use `httpOnly: true`, configurable `secure`, and `sameSite: 'lax'`.
- Upon successful login, the session ID is **regenerated** via `req.session.regenerate()` to completely prevent session fixation attacks.

### 3. CSRF Protection (Synchronizer Token Pattern)
- Every active session is issued a cryptographically random synchronizer token (`crypto.randomBytes(32)`).
- All mutating administrative requests (`POST`, `PATCH`, `PUT`, `DELETE`), including logout, must provide the `X-CSRF-Token` header.
- Tokens are compared using timing-safe buffer comparison (`crypto.timingSafeEqual`).
- Safe read requests (`GET`, `HEAD`, `OPTIONS`) and the public `/login` endpoint bypass CSRF verification.

### 4. Role-Based Access Control (RBAC)
- Supported roles: `SUPERADMIN`, `ADMIN`, `STAFF`.
- Categorization and product mutations require `ADMIN` or `SUPERADMIN`.
- Account deactivation check: if an administrator's record has `isActive: false`, any subsequent request destroys the session and returns HTTP 401 `ACCOUNT_INACTIVE`.

### 5. Brute-Force Rate Limiting
The login endpoint `/api/v1/auth/login` is rate-limited to 10 attempts per 15 minutes per IP using `express-rate-limit`.

---

## 6. Authentication REST API Reference

### 1. Administrator Login
- **Method & Path**: `POST /api/v1/auth/login`
- **Body**:
```json
{
  "email": "admin@divinefavour.com",
  "password": "YourSecurePassword123!"
}
```
- **Success Response (HTTP 200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "30ba9b8a-f611-4960-afe4-6edd460c6c62",
      "name": "Divine Admin",
      "email": "admin@divinefavour.com",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2026-10-14T15:30:26.790Z"
    },
    "csrfToken": "a8c9b2...64chars"
  }
}
```
- Sets `Set-Cookie: df_sid=...; Path=/; HttpOnly; SameSite=Lax`.

### 2. Current Session / User Profile
- **Method & Path**: `GET /api/v1/auth/me`
- **Requires**: Valid session cookie (`df_sid`).
- **Response**: Returns authenticated administrator details and current `csrfToken`. Returns HTTP 401 if unauthenticated or session expired.

### 3. Administrator Logout
- **Method & Path**: `POST /api/v1/auth/logout`
- **Requires**: Valid session cookie and `X-CSRF-Token` header.
- **Response**: Destroys session in PostgreSQL and clears the session cookie.

### 4. CSRF Token Endpoint
- **Method & Path**: `GET /api/v1/auth/csrf`
- **Response**: Returns the synchronizer token for the current session.

---

## 7. Product & Category REST API Reference

### Categories API (`/api/v1/categories`)

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Public | List categories ordered by `displayOrder` |
| `GET` | `/api/v1/categories/:slug` | Public | Get single category by slug |
| `POST` | `/api/v1/categories` | Admin + CSRF | Create category (requires `ADMIN` or `SUPERADMIN`) |
| `PATCH` | `/api/v1/categories/:id` | Admin + CSRF | Update category fields |
| `DELETE`| `/api/v1/categories/:id` | Admin + CSRF | Delete category (safe guard prevents deletion if products exist) |

### Products API (`/api/v1/products`)

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products` | Public | Paginated product search, filtering, and sorting |
| `GET` | `/api/v1/products/:slug` | Public | Get single product by slug |
| `POST` | `/api/v1/products` | Admin + CSRF | Create product (requires `ADMIN` or `SUPERADMIN`) |
| `PATCH` | `/api/v1/products/:id` | Admin + CSRF | Update product fields |
| `DELETE`| `/api/v1/products/:id` | Admin + CSRF | Delete product |

### Public Enquiries API (`/api/v1/enquiries`)

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/enquiries` | Public (Rate Limited) | Submit quotation request or general enquiry. Validates items and generates non-sequential customer reference (`DF-YYYYMM-XXXX`). |

### Administrative Enquiries API (`/api/v1/admin/enquiries`)

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/enquiries` | Authenticated Staff | Paginated list with search, status, and type filtering. Never exposes internal notes in list view. |
| `GET` | `/api/v1/admin/enquiries/:id` | Authenticated Staff | Get single enquiry record including requested product items and staff notes. |
| `PATCH` | `/api/v1/admin/enquiries/:id/status` | Staff + CSRF | Update enquiry workflow status (`NEW`, `IN_REVIEW`, `CONTACTED`, `QUOTED`, `CLOSED`). |
| `GET` | `/api/v1/admin/enquiries/:id/notes` | Authenticated Staff | List chronological internal staff notes for the enquiry. |
| `POST` | `/api/v1/admin/enquiries/:id/notes` | Staff + CSRF | Create internal staff note attached to logged-in user. |
| `PATCH` | `/api/v1/admin/enquiries/:id/notes/:noteId` | Staff + CSRF | Edit staff note (author only or `SUPERADMIN`). |
| `DELETE`| `/api/v1/admin/enquiries/:id/notes/:noteId` | Staff + CSRF | Delete staff note (author only or `SUPERADMIN`). |

---

## 8. cURL Testing Guide

### 1. Log In and Save Cookie
```bash
curl -i -c cookies.txt -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@divinefavour.com", "password": "YourSecurePassword123!"}'
```

### 2. Verify Session via `/auth/me`
```bash
curl -i -b cookies.txt http://localhost:5000/api/v1/auth/me
```

### 3. Submit a Public Quotation Request
```bash
curl -i -X POST http://localhost:5000/api/v1/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Chinedu Okafor",
    "businessName": "Okafor Wholesalers Ltd",
    "customerPhone": "+2348012345678",
    "customerEmail": "chinedu@okafor.ng",
    "customerType": "wholesaler",
    "enquiryType": "quote_standard",
    "customerMessage": "Require monthly deliveries of carrier bags to Onitsha main market.",
    "source": "Website Quote Form",
    "items": [
      {
        "productSlug": "plain-punch-handle-carrier-bags",
        "quantity": 10000,
        "unit": "pieces",
        "size": "Medium (12 x 18 inches)",
        "gauge": "40 microns",
        "color": "Milky White",
        "customPrinting": "no"
      }
    ]
  }'
```

### 4. Query Administrative Enquiries List
```bash
curl -i -b cookies.txt "http://localhost:5000/api/v1/admin/enquiries?page=1&limit=10&status=NEW"
```

### 5. Add Internal Staff Note
```bash
curl -i -b cookies.txt -X POST http://localhost:5000/api/v1/admin/enquiries/<ENQUIRY_ID>/notes \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <YOUR_CSRF_TOKEN>" \
  -d '{"content": "Customer called for clarification on sample thickness. Samples dispatched via courier."}'
```

### 6. Public Business Settings Retrieval
```bash
curl -i http://localhost:5000/api/v1/business-settings
```
*Response: Public JSON containing businessName, tagline, contact channels, operating hours, social links, meta SEO titles, quote instructions, and public announcement (internal admin metadata and database secrets strictly omitted).*

### 7. Administrative Business Settings Partial Update
```bash
curl -i -b cookies.txt -X PATCH http://localhost:5000/api/v1/admin/business-settings \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <YOUR_CSRF_TOKEN>" \
  -d '{
    "tagline": "Quality Packaging. Reliable Supply.",
    "phone": "+234 803 000 1122",
    "publicAnnouncement": "Factory maintenance scheduled for public holiday; orders dispatching as usual."
  }'
```

---

## 9. Automated Testing

Run the full Vitest automated test suite:

```bash
cd server
npx vitest run --no-file-parallelism
```

All 10 test suites (98 automated tests) pass:
- `businessSettings.test.ts` (17 tests): Public `GET /api/v1/business-settings` (excludes internal audit IDs/secrets, provides alias normalization), Admin `GET /api/v1/admin/business-settings` (authenticates STAFF/ADMIN, rejects unauthenticated), Admin `PATCH /api/v1/admin/business-settings` (rejects unauthenticated with 401, enforces CSRF token with 403, restricts mutation to ADMIN role, validates email/phone format, prevents mass-assignment, performs partial updates while preserving omitted fields, allows clearing optional fields with null, persists updates to public endpoint, singleton pattern guarantee).
- `enquiries.test.ts` (26 tests): Public quote submissions with product snapshots, custom packaging requests, general contact messages, phone/email validation, catalog slug checks, rate limiting abuse protection, admin listing pagination & filters, internal note leakage prevention, status transitions with CSRF checks, staff notes CRUD, author-only edit/delete permissions, and cross-enquiry tamper defenses.
- `auth.test.ts` (15 tests): Login, password verification, generic timing errors, session creation & rotation, inactive account invalidation, CSRF protection, RBAC permission enforcement.
- `products.test.ts` (12 tests): Pagination metadata, text search, category filtering, featured filtering, sorting allowlist, slug retrieval, authenticated creation, invalid category validation, slug conflicts, updates, and deletion.
- `categories.test.ts` (9 tests): Category retrieval, slug lookup, authenticated creation, duplicate slug conflict, updates, safe deletion guard.
- `adminGuard.test.ts` (6 tests): Boundary checks verifying unauthenticated mutations return HTTP 401 while public reads succeed.
- `env.test.ts` (5 tests): Zod environment validation and production `SESSION_SECRET` length requirements.
- `app.test.ts` (4 tests): Global error handling, malformed JSON handling, and 404 handler.
- `health.test.ts` (3 tests): Liveness and database readiness probes.
- `prisma.test.ts` (1 test): Prisma client model connectivity and delegates.
