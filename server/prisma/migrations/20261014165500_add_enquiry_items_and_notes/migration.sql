-- AlterTable
ALTER TABLE "enquiries" ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "subject" TEXT,
ALTER COLUMN "requestedProductName" DROP NOT NULL;

-- CreateTable
CREATE TABLE "enquiry_items" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "productSlug" TEXT,
    "quantity" INTEGER,
    "unit" TEXT,
    "size" TEXT,
    "gauge" TEXT,
    "color" TEXT,
    "customPrinting" TEXT,
    "specifications" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiry_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiry_notes" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "authorId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enquiry_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enquiry_items_enquiryId_idx" ON "enquiry_items"("enquiryId");

-- CreateIndex
CREATE INDEX "enquiry_notes_enquiryId_idx" ON "enquiry_notes"("enquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "enquiries_reference_key" ON "enquiries"("reference");

-- CreateIndex
CREATE INDEX "enquiries_reference_idx" ON "enquiries"("reference");

-- AddForeignKey
ALTER TABLE "enquiry_items" ADD CONSTRAINT "enquiry_items_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiry_items" ADD CONSTRAINT "enquiry_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiry_notes" ADD CONSTRAINT "enquiry_notes_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiry_notes" ADD CONSTRAINT "enquiry_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
