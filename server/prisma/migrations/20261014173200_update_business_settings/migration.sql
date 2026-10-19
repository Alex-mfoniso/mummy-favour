-- AlterTable
ALTER TABLE "business_settings" ALTER COLUMN "businessName" SET DEFAULT 'Divine Favour',
ALTER COLUMN "tagline" SET DEFAULT 'Quality Packaging. Reliable Supply.',
ALTER COLUMN "businessDescription" DROP NOT NULL,
ADD COLUMN     "businessHours" JSONB,
ADD COLUMN     "fullDescription" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "publicAnnouncement" TEXT,
ADD COLUMN     "quoteInstructions" TEXT,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "socialLinks" JSONB;
