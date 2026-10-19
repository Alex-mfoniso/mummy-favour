-- AlterTable
ALTER TABLE "enquiries" ADD COLUMN "trackingTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "enquiries_trackingTokenHash_key" ON "enquiries"("trackingTokenHash");

-- CreateIndex
CREATE INDEX "enquiries_trackingTokenHash_idx" ON "enquiries"("trackingTokenHash");
