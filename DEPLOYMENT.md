# Divine Favour — Production Deployment & Operations Runbook

This runbook provides complete, production-grade instructions for deploying, provisioning, and operating the Divine Favour Nylon Manufacturing website and backend platform.

---

## 1. Architecture Overview

```
 [ Client Browser / Customer / Admin ]
                 │
                 ├── HTTPS (Port 443)
                 │
   ┌─────────────┴────────────────────────┐
   ▼                                      ▼
[ Frontend SPA: React + Vite ]     [ Backend API: Express + Node.js ]
Domain: divinefavourpackaging.com    Domain: api.divinefavourpackaging.com
Hosting: Vercel / Netlify            Hosting: Render / Railway / Fly.io / Docker
         │                                        │
         │ (Public REST / CORS with Credentials)   │ (Prisma Client + pg Pool)
         └────────────────────────────────────────┤
                                                  ▼
                                      [ Managed PostgreSQL 16 ]
                                      Hosting: Neon / Supabase / Render
                                      Connection: SSL required (?sslmode=require)
```

---

## 2. Recommended Hosting Providers

| Component | Recommended Provider | Alternative | Free/Entry Tier Available? |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** / **Netlify** | Cloudflare Pages, Nginx Alpine | Yes (Zero-config SPA builds) |
| **Backend API** | **Render** / **Railway** | Fly.io, DigitalOcean App Platform | Yes / Low-cost |
| **Database** | **Render PostgreSQL** / **Neon** | Supabase, AWS RDS, Railway | Yes (Managed PostgreSQL 16) |
| **DNS / SSL** | **Cloudflare** | Namecheap, Google Domains | Yes (Automated TLS certificates) |

---

## 3. Environment Variables Specification

### A. Frontend Environment (`.env.production` or Host Build Settings)
> **Note**: Statically bundled into JavaScript at build time. **Never put secrets or database URLs here.**

| Variable | Description | Example Production Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint of the deployed backend API | `https://api.divinefavourpackaging.com/api/v1` |
| `VITE_BUSINESS_WHATSAPP_NUMBER` | Official WhatsApp line (digits only) | `2348012345678` (leave blank until verified) |
| `VITE_BUSINESS_PHONE` | Official customer support phone line | `+234 801 234 5678` (leave blank until verified) |
| `VITE_BUSINESS_EMAIL` | Official sales contact email | `sales@divinefavourpackaging.com` (leave blank until verified) |
| `VITE_BUSINESS_ADDRESS` | Factory/Plant location | `Industrial Zone, Onitsha, Anambra State, Nigeria` |

### B. Backend Environment (`.env` or Cloud Platform Environment Settings)
> **Note**: Injected securely into the server process at runtime. **Never committed to Git.**

| Variable | Required | Description | Example / Instructions |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | Runtime mode | `production` |
| `PORT` | Auto | Server port (assigned by host) | `5000` (or dynamic `$PORT`) |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname?sslmode=require&schema=public` |
| `CORS_ORIGIN` | **Yes** | Approved frontend origins (comma-separated) | `https://divinefavourpackaging.com,https://www.divinefavourpackaging.com` |
| `SESSION_SECRET` | **Yes** | Minimum 32-character random string | Generate via: `openssl rand -hex 32` |
| `SESSION_MAX_AGE_MS`| No | Session lifetime in ms | `86400000` (24 hours) |
| `COOKIE_SECURE` | No | Transmit cookies over HTTPS only | `true` (auto-defaults to true in production) |
| `COOKIE_SAME_SITE` | No | Cookie SameSite policy | `lax` |
| `AUTH_RATE_LIMIT_MAX`| No | Max login attempts per 15 min | `10` |

---

## 4. Database Setup & Migration Deployment

### Step 1: Verify PostgreSQL Connection
Ensure your managed PostgreSQL instance is created and reachable with SSL.

### Step 2: Apply Migrations
Execute Prisma's non-destructive production migration command from the `server/` directory:
```bash
npm run prisma:migrate:deploy
```
*(Or via npx: `npx prisma migrate deploy`)*

This applies all 5 baseline migrations without dropping tables or resetting data:
1. `20261014144016_init` (Core schema: categories, products, admin users)
2. `20261014151031_add_session_model` (PostgreSQL session store table)
3. `20261014165500_add_enquiry_items_and_notes` (Customer enquiry tables)
4. `20261014173200_update_business_settings` (Dynamic settings singleton)
5. `20261014184000_phase12_5_enquiry_tracking` (Hashed enquiry tracking tokens)

### Step 3: Seed Baseline Catalog (Optional / Idempotent)
To populate standard categories, products, and default business settings using safe upserts:
```bash
npm run db:seed
```
*Note: This does not seed mock enquiries or fake administrator accounts.*

---

## 5. First Administrator Provisioning

The platform contains no public registration endpoints for administrative security.
Create the primary administrator using the secure provisioning CLI:

### Option A: Interactive TTY Prompt (Recommended)
```bash
cd server
npm run admin:provision
```
You will be prompted securely:
```text
Enter administrator full name: Alex Okoye
Enter administrator email: admin@divinefavourpackaging.com
Enter administrator password (min 8 chars): **********
Role (ADMIN / STAFF / SUPERADMIN) [default: ADMIN]: ADMIN
```

### Option B: Environment Variables in One-Off Cloud Task
```bash
ADMIN_NAME="Primary Admin" ADMIN_EMAIL="admin@divinefavourpackaging.com" ADMIN_PASSWORD="AStrongPassphrase123!" npm run admin:provision
```

Passwords are encrypted with **Argon2id** (memory cost: 64MB, iterations: 3, parallelism: 1). Passwords are never logged.

---

## 6. Deployment Step-by-Step

### Method 1: Platform-as-a-Service (Render / Vercel)

#### 1. Deploy Frontend on Vercel or Netlify
1. Connect your Git repository to **Vercel** or **Netlify**.
2. Set **Root Directory** to `.` (root).
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Configure Environment Variables:
   - `VITE_API_BASE_URL`: `https://api.divinefavourpackaging.com/api/v1`
6. Deploy. Client-side routes are automatically handled by `vercel.json` and `public/_redirects`.

#### 2. Deploy Backend on Render or Railway
1. Create a **New Web Service** pointing to the Git repository.
2. Set **Root Directory**: `server`
3. Set **Build Command**: `npm ci && npm run prisma:generate && npm run build`
4. Set **Start Command**: `npm run prisma:migrate:deploy && npm run start`
5. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `postgresql://...`
   - `CORS_ORIGIN`: `https://divinefavourpackaging.com`
   - `SESSION_SECRET`: `<generated 64-char string>`
6. Deploy. Health checks are automatically available at `/api/v1/health`.

---

### Method 2: Containerized Deployment (Docker / VPS / Docker Compose)

The repository includes ready-to-use Dockerfiles and `docker-compose.prod.yml`.

To deploy on a Linux VPS (e.g. Ubuntu with Docker and Docker Compose):
```bash
# 1. Clone repository
git clone <repo-url> divine-favour
cd divine-favour

# 2. Configure production secrets in .env
cat <<EOF > .env
POSTGRES_USER=df_admin
POSTGRES_PASSWORD=$(openssl rand -hex 16)
POSTGRES_DB=divine_favour_prod
SESSION_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=https://divinefavourpackaging.com
VITE_API_BASE_URL=https://api.divinefavourpackaging.com/api/v1
EOF

# 3. Build and launch containers in background
docker compose -f docker-compose.prod.yml up -d --build

# 4. Provision initial administrator inside API container
docker compose -f docker-compose.prod.yml exec -it api npm run admin:provision
```

---

## 7. Operational Runbook & Disaster Recovery

### A. Automated Database Backups
- **Managed Provider**: Enable automated daily backups in your PostgreSQL provider dashboard (Render, Neon, AWS RDS) with at least **7-day retention**.
- **Self-Hosted / VPS Cron Backup**:
  ```bash
  # Daily cron dump script: /opt/scripts/backup_db.sh
  pg_dump -Fc -U postgres -d divine_favour_prod > /var/backups/df_$(date +\%Y\%m\%d_\%H\%M\%S).dump
  # Retain last 14 days
  find /var/backups -type f -name "df_*.dump" -mtime +14 -delete
  ```

### B. Database Restore Procedure
```bash
# Terminate existing connections and restore from archive
pg_restore --clean --if-exists -U postgres -d divine_favour_prod /var/backups/df_YYYYMMDD.dump
```

### C. Secret Rotation Procedure
If `SESSION_SECRET` is suspected to be compromised:
1. Generate a new 64-character hex secret (`openssl rand -hex 32`).
2. Update `SESSION_SECRET` in the host's environment settings.
3. Restart the backend service. All existing active sessions will be invalidated, requiring staff to log in again.
4. Existing customer tracking tokens remain valid because they rely on independent SHA-256 hashes stored with each record.

### D. Administrator Revocation
If an administrator account needs to be immediately revoked:
1. Log in with another administrator account.
2. Navigate to **Admin Dashboard ➔ Settings / Users** (or update in database: `UPDATE "AdminUser" SET "isActive" = false WHERE email = 'target@example.com'`).
3. Delete active session rows for the revoked user:
   `DELETE FROM "session" WHERE sess::text LIKE '%target@example.com%';`
