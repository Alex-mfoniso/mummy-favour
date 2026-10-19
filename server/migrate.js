import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres:alex123@localhost:5432/divine_favour_dev?schema=public";

async function run() {
  console.log("Starting migration...");
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected to PostgreSQL successfully");

  try {
    // 1. Enum update (Must be outside transaction in Postgres so it commits immediately)
    console.log("Adding SUPER_ADMIN to AdminRole enum...");
    await client.query(`ALTER TYPE "AdminRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';`);

    // 2. Transaction for tables and new types
    await client.query("BEGIN;");

    console.log("Creating new enums for orders, payments, dispatch...");
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "OrderStatus" AS ENUM (
          'DRAFT', 'AWAITING_DEPOSIT', 'IN_PRODUCTION', 'PRODUCTION_COMPLETED',
          'READY_FOR_DISPATCH', 'DISPATCHED_TO_PARK', 'ARRIVED_AT_PARK',
          'AWAITING_BALANCE', 'CLEARED_FOR_RELEASE', 'RELEASED', 'COMPLETED', 'CANCELLED'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "OrderPaymentStatus" AS ENUM (
          'PENDING_DEPOSIT', 'DEPOSIT_SUBMITTED', 'DEPOSIT_VERIFIED',
          'AWAITING_BALANCE', 'BALANCE_SUBMITTED', 'PAID_IN_FULL'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "OrderProductionStatus" AS ENUM (
          'AWAITING_DEPOSIT', 'IN_PRODUCTION', 'PRODUCTION_COMPLETED', 'READY_FOR_DISPATCH'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PaymentType" AS ENUM ('DEPOSIT', 'BALANCE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "DispatchMethod" AS ENUM ('WAYBILL', 'DIRECT_PICKUP', 'LOCAL_DELIVERY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "DispatchStatus" AS ENUM (
          'NOT_DISPATCHED', 'IN_TRANSIT_TO_PARK', 'ARRIVED_AT_PARK',
          'AWAITING_BALANCE', 'CLEARED_FOR_RELEASE', 'RELEASED', 'COMPLETED'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. Audit logs table
    console.log("Creating audit_logs table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "action" TEXT NOT NULL,
        "actor_id" TEXT,
        "target_id" TEXT,
        "details" JSONB,
        "ip_address" TEXT,
        "user_agent" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "audit_logs_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
      CREATE INDEX IF NOT EXISTS "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");
      CREATE INDEX IF NOT EXISTS "audit_logs_target_id_idx" ON "audit_logs"("target_id");
      CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");
    `);

    // 4. Orders table
    console.log("Creating orders table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "order_number" TEXT NOT NULL UNIQUE,
        "enquiry_id" TEXT,
        "customer_name" TEXT NOT NULL,
        "customer_email" TEXT,
        "customer_phone" TEXT NOT NULL,
        "delivery_address" TEXT,
        "currency" TEXT NOT NULL DEFAULT 'NGN',
        "subtotal" DECIMAL(12,2) NOT NULL,
        "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "total_amount" DECIMAL(12,2) NOT NULL,
        "deposit_required" DECIMAL(12,2) NOT NULL,
        "balance_required" DECIMAL(12,2) NOT NULL,
        "deposit_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "balance_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "payment_status" "OrderPaymentStatus" NOT NULL DEFAULT 'PENDING_DEPOSIT',
        "production_status" "OrderProductionStatus" NOT NULL DEFAULT 'AWAITING_DEPOSIT',
        "status" "OrderStatus" NOT NULL DEFAULT 'AWAITING_DEPOSIT',
        "notes" TEXT,
        "created_by_id" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "orders_enquiry_id_fkey" FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "orders_order_number_idx" ON "orders"("order_number");
      CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");
      CREATE INDEX IF NOT EXISTS "orders_payment_status_idx" ON "orders"("payment_status");
      CREATE INDEX IF NOT EXISTS "orders_production_status_idx" ON "orders"("production_status");
      CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders"("created_at");
    `);

    // 5. Order items table
    console.log("Creating order_items table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "order_id" TEXT NOT NULL,
        "product_id" TEXT,
        "product_name" TEXT NOT NULL,
        "specifications" TEXT,
        "quantity" INTEGER NOT NULL,
        "unit" TEXT NOT NULL DEFAULT 'units',
        "unit_price" DECIMAL(12,2) NOT NULL,
        "line_total" DECIMAL(12,2) NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items"("order_id");
    `);

    // 6. Payments table
    console.log("Creating payments table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "order_id" TEXT NOT NULL,
        "payment_type" "PaymentType" NOT NULL,
        "amount_expected" DECIMAL(12,2) NOT NULL,
        "amount_received" DECIMAL(12,2),
        "payment_method" TEXT,
        "payment_reference" TEXT,
        "customer_claim_ref" TEXT,
        "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
        "verified_by_id" TEXT,
        "verified_at" TIMESTAMP(3),
        "internal_notes" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "payments_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "payments_order_id_idx" ON "payments"("order_id");
      CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments"("status");
    `);

    // 7. Dispatches table
    console.log("Creating dispatches table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "dispatches" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "order_id" TEXT NOT NULL UNIQUE,
        "dispatch_method" "DispatchMethod" NOT NULL DEFAULT 'WAYBILL',
        "transport_company" TEXT,
        "park_destination" TEXT,
        "waybill_number" TEXT,
        "driver_name" TEXT,
        "driver_phone" TEXT,
        "vehicle_plate" TEXT,
        "dispatch_status" "DispatchStatus" NOT NULL DEFAULT 'NOT_DISPATCHED',
        "dispatched_at" TIMESTAMP(3),
        "park_arrival_confirmed_at" TIMESTAMP(3),
        "arrival_confirmer_name" TEXT,
        "arrival_notes" TEXT,
        "balance_requested_at" TIMESTAMP(3),
        "release_authorized_by_id" TEXT,
        "release_authorized_at" TIMESTAMP(3),
        "release_notes" TEXT,
        "released_at" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "dispatches_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "dispatches_release_authorized_by_id_fkey" FOREIGN KEY ("release_authorized_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    await client.query("COMMIT;");
    console.log("Tables and types committed!");

    // 8. Now in a fresh transaction, update the role to SUPER_ADMIN
    console.log("Promoting primary owner admin@divinefavour.com to SUPER_ADMIN...");
    await client.query(`
      UPDATE "admin_users" 
      SET "role" = 'SUPER_ADMIN' 
      WHERE "email" = 'admin@divinefavour.com';
    `);

    console.log("SUCCESS: All tables, enums, indexes, and relations migrated successfully!");
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
