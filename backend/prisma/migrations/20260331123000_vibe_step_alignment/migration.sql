-- VIBE_CODING step alignment (non-breaking additive migration)

-- User aliases
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pinHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "kycStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- Transaction aliases / offline sync fields
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "clientUUID" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "receiptURL" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "createdOfflineAt" TIMESTAMP(3);
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "originalTransactionID" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_originalTransactionID_fkey'
  ) THEN
    ALTER TABLE "Transaction"
      ADD CONSTRAINT "Transaction_originalTransactionID_fkey"
      FOREIGN KEY ("originalTransactionID") REFERENCES "Transaction"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_clientUUID_key" ON "Transaction"("clientUUID");
CREATE INDEX IF NOT EXISTS "Transaction_originalTransactionID_idx" ON "Transaction"("originalTransactionID");

-- AuditLog aliases
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "entityID" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "oldValue" JSONB;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "newValue" JSONB;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "deviceUUID" TEXT;

-- Product aliases
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "unit" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "salePrice" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "alertThreshold" DOUBLE PRECISION;

-- Loan aliases and optional bank relation
ALTER TABLE "Loan" ADD COLUMN IF NOT EXISTS "bankID" TEXT;
ALTER TABLE "Loan" ADD COLUMN IF NOT EXISTS "dossierURL" TEXT;

-- TaxRule aliases
ALTER TABLE "TaxRule" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "TaxRule" ADD COLUMN IF NOT EXISTS "regimeName" TEXT;
ALTER TABLE "TaxRule" ADD COLUMN IF NOT EXISTS "caMin" DOUBLE PRECISION;
ALTER TABLE "TaxRule" ADD COLUMN IF NOT EXISTS "caMax" DOUBLE PRECISION;
ALTER TABLE "TaxRule" ADD COLUMN IF NOT EXISTS "rate" DOUBLE PRECISION;
ALTER TABLE "TaxRule" ADD COLUMN IF NOT EXISTS "fixedAmount" DOUBLE PRECISION;

-- CreditScore aliases
ALTER TABLE "CreditScore" ADD COLUMN IF NOT EXISTS "total" INTEGER;
ALTER TABLE "CreditScore" ADD COLUMN IF NOT EXISTS "scoreRevenue" INTEGER;
ALTER TABLE "CreditScore" ADD COLUMN IF NOT EXISTS "scoreRegularity" INTEGER;
ALTER TABLE "CreditScore" ADD COLUMN IF NOT EXISTS "scoreCancellation" INTEGER;
ALTER TABLE "CreditScore" ADD COLUMN IF NOT EXISTS "scoreSeniority" INTEGER;
ALTER TABLE "CreditScore" ADD COLUMN IF NOT EXISTS "scoreDiversity" INTEGER;
ALTER TABLE "CreditScore" ADD COLUMN IF NOT EXISTS "computedAt" TIMESTAMP(3);

-- New tables from VIBE prompt
CREATE TABLE IF NOT EXISTS "Bank" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "webhookURL" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Consent" (
  "id" TEXT NOT NULL,
  "merchantID" TEXT NOT NULL,
  "bankerID" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Document" (
  "id" TEXT NOT NULL,
  "userID" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "hashSHA256" TEXT NOT NULL,
  "qrToken" TEXT NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Document_qrToken_key" ON "Document"("qrToken");
CREATE INDEX IF NOT EXISTS "Consent_merchantID_idx" ON "Consent"("merchantID");
CREATE INDEX IF NOT EXISTS "Consent_bankerID_idx" ON "Consent"("bankerID");
CREATE INDEX IF NOT EXISTS "Document_userID_idx" ON "Document"("userID");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Loan_bankID_fkey'
  ) THEN
    ALTER TABLE "Loan"
      ADD CONSTRAINT "Loan_bankID_fkey"
      FOREIGN KEY ("bankID") REFERENCES "Bank"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Document_userID_fkey'
  ) THEN
    ALTER TABLE "Document"
      ADD CONSTRAINT "Document_userID_fkey"
      FOREIGN KEY ("userID") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
