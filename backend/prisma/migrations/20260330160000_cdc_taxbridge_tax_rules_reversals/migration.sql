-- TaxBridge CDC v2 — annulations immuables, produits, barèmes fiscaux

-- AlterEnum (compatible PG 14+)
DO $$ BEGIN
  ALTER TYPE "TransactionType" ADD VALUE 'ANNULATION';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "costPrice" DOUBLE PRECISION;

-- FK Product -> Merchant (si absent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Product_merchantID_fkey'
  ) THEN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_merchantID_fkey"
      FOREIGN KEY ("merchantID") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AlterTable Transaction
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "reversalOfId" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "quantity" INTEGER;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "unitPrice" DOUBLE PRECISION;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_reversalOfId_fkey'
  ) THEN
    ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_reversalOfId_fkey"
      FOREIGN KEY ("reversalOfId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_productId_fkey'
  ) THEN
    ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Transaction_reversalOfId_idx" ON "Transaction"("reversalOfId");
CREATE INDEX IF NOT EXISTS "Transaction_productId_idx" ON "Transaction"("productId");

-- CreateTable TaxRule
CREATE TABLE IF NOT EXISTS "TaxRule" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'BJ',
    "year" INTEGER NOT NULL,
    "regime" "TaxRegime" NOT NULL,
    "label" TEXT NOT NULL,
    "minAnnualCA" DOUBLE PRECISION,
    "maxAnnualCA" DOUBLE PRECISION,
    "syntheticRatePercent" DOUBLE PRECISION,
    "rrsRatePercent" DOUBLE PRECISION,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TaxRule_countryCode_year_regime_idx" ON "TaxRule"("countryCode", "year", "regime");
