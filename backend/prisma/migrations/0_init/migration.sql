-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MERCHANT', 'COMPTABLE', 'BANKER', 'DGI', 'ADMIN', 'KYC_PARTNER');

-- CreateEnum
CREATE TYPE "TaxRegime" AS ENUM ('TS', 'RRS', 'NORMAL');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('VENTE', 'DÉPENSE', 'RETRAIT', 'DÉPÔT', 'REMBOURSEMENT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ACCEPTED', 'DISBURSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CredType" AS ENUM ('NATIONAL_ID', 'PASSPORT', 'DRIVER_LICENSE', 'OTHER');

-- CreateEnum
CREATE TYPE "CertType" AS ENUM ('JOURNAL', 'COMPTE_DE_RÉSULTAT', 'BILAN', 'DÉCLARATION_TS', 'BORDEREAU_VERSEMENT');

-- CreateEnum
CREATE TYPE "CertStatus" AS ENUM ('DRAFT', 'PENDING', 'SIGNED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MERCHANT',
    "firstName" TEXT,
    "lastName" TEXT,
    "businessName" TEXT,
    "email" TEXT,
    "deviceUUID" TEXT,
    "deviceFP" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "businessLocation" TEXT,
    "businessPhone" TEXT,
    "monthlyCAAvg" DOUBLE PRECISION,
    "annualCAEstimate" DOUBLE PRECISION,
    "taxRegime" "TaxRegime" NOT NULL DEFAULT 'TS',
    "creditScore" INTEGER NOT NULL DEFAULT 300,
    "scoreLastUpdated" TIMESTAMP(3),
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationDate" TIMESTAMP(3),

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comptable" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "companyName" TEXT,
    "licenseNumber" TEXT,
    "clientsManaged" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comptable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComptableClient" (
    "id" TEXT NOT NULL,
    "comptableID" TEXT NOT NULL,
    "merchantID" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComptableClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banker" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT,
    "branchCode" TEXT,
    "position" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Banker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY['all'],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "type" "CredType" NOT NULL,
    "identifier" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verificationProvider" TEXT,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "merchantID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "category" TEXT,
    "description" TEXT,
    "receiptPhoto" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "certID" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "merchantID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "minAlertLevel" INTEGER NOT NULL DEFAULT 5,
    "alertSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "merchantID" TEXT NOT NULL,
    "requesterID" TEXT NOT NULL,
    "bankName" TEXT,
    "loanAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "purpose" TEXT,
    "status" "LoanStatus" NOT NULL DEFAULT 'DRAFT',
    "scoreAtRequest" INTEGER,
    "certifyingDocs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "appliedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "merchantID" TEXT NOT NULL,
    "type" "CertType" NOT NULL,
    "period" TEXT NOT NULL,
    "pdfPath" TEXT,
    "pdfHash" TEXT,
    "qrCode" TEXT,
    "verifyURL" TEXT,
    "signedAt" TIMESTAMP(3),
    "signatureData" TEXT,
    "status" "CertStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" TIMESTAMP(3),

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalData" (
    "id" TEXT NOT NULL,
    "merchantID" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalCA" DOUBLE PRECISION NOT NULL,
    "totalCharges" DOUBLE PRECISION NOT NULL,
    "netResult" DOUBLE PRECISION NOT NULL,
    "taxRegime" "TaxRegime" NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "tsRate" DOUBLE PRECISION,
    "tvaRate" DOUBLE PRECISION NOT NULL DEFAULT 0.18,
    "isRate" DOUBLE PRECISION,
    "declarationSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditScore" (
    "id" TEXT NOT NULL,
    "merchantID" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditScoreBreakdown" (
    "id" TEXT NOT NULL,
    "scoringID" TEXT NOT NULL,
    "criterion" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "maxPoints" INTEGER NOT NULL,

    CONSTRAINT "CreditScoreBreakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resourceID" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRVerification" (
    "id" TEXT NOT NULL,
    "certID" TEXT NOT NULL,
    "verifiedBy" TEXT,
    "verificationIP" TEXT,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "details" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_userID_key" ON "Merchant"("userID");

-- CreateIndex
CREATE INDEX "Merchant_userID_idx" ON "Merchant"("userID");

-- CreateIndex
CREATE INDEX "Merchant_creditScore_idx" ON "Merchant"("creditScore");

-- CreateIndex
CREATE UNIQUE INDEX "Comptable_userID_key" ON "Comptable"("userID");

-- CreateIndex
CREATE INDEX "Comptable_userID_idx" ON "Comptable"("userID");

-- CreateIndex
CREATE INDEX "ComptableClient_comptableID_idx" ON "ComptableClient"("comptableID");

-- CreateIndex
CREATE INDEX "ComptableClient_merchantID_idx" ON "ComptableClient"("merchantID");

-- CreateIndex
CREATE UNIQUE INDEX "ComptableClient_comptableID_merchantID_key" ON "ComptableClient"("comptableID", "merchantID");

-- CreateIndex
CREATE UNIQUE INDEX "Banker_userID_key" ON "Banker"("userID");

-- CreateIndex
CREATE INDEX "Banker_userID_idx" ON "Banker"("userID");

-- CreateIndex
CREATE INDEX "Banker_bankName_idx" ON "Banker"("bankName");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userID_key" ON "Admin"("userID");

-- CreateIndex
CREATE INDEX "Admin_userID_idx" ON "Admin"("userID");

-- CreateIndex
CREATE INDEX "Credential_userID_idx" ON "Credential"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_identifier_key" ON "Credential"("identifier");

-- CreateIndex
CREATE INDEX "Transaction_merchantID_idx" ON "Transaction"("merchantID");

-- CreateIndex
CREATE INDEX "Transaction_userID_idx" ON "Transaction"("userID");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Product_merchantID_sku_key" ON "Product"("merchantID", "sku");

-- CreateIndex
CREATE INDEX "Product_merchantID_idx" ON "Product"("merchantID");

-- CreateIndex
CREATE INDEX "Loan_merchantID_idx" ON "Loan"("merchantID");

-- CreateIndex
CREATE INDEX "Loan_status_idx" ON "Loan"("status");

-- CreateIndex
CREATE INDEX "Certificate_merchantID_idx" ON "Certificate"("merchantID");

-- CreateIndex
CREATE INDEX "Certificate_type_idx" ON "Certificate"("type");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalData_merchantID_key" ON "FiscalData"("merchantID");

-- CreateIndex
CREATE INDEX "FiscalData_merchantID_idx" ON "FiscalData"("merchantID");

-- CreateIndex
CREATE INDEX "FiscalData_year_idx" ON "FiscalData"("year");

-- CreateIndex
CREATE INDEX "CreditScore_merchantID_idx" ON "CreditScore"("merchantID");

-- CreateIndex
CREATE INDEX "CreditScore_calculatedAt_idx" ON "CreditScore"("calculatedAt");

-- CreateIndex
CREATE INDEX "CreditScoreBreakdown_scoringID_idx" ON "CreditScoreBreakdown"("scoringID");

-- CreateIndex
CREATE INDEX "AuditLog_userID_idx" ON "AuditLog"("userID");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "QRVerification_certID_idx" ON "QRVerification"("certID");

-- CreateIndex
CREATE INDEX "QRVerification_verifiedAt_idx" ON "QRVerification"("verifiedAt");

-- CreateIndex
CREATE INDEX "Notification_userID_idx" ON "Notification"("userID");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config"("key");

-- CreateIndex
CREATE INDEX "Config_key_idx" ON "Config"("key");

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comptable" ADD CONSTRAINT "Comptable_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComptableClient" ADD CONSTRAINT "ComptableClient_comptableID_fkey" FOREIGN KEY ("comptableID") REFERENCES "Comptable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComptableClient" ADD CONSTRAINT "ComptableClient_merchantID_fkey" FOREIGN KEY ("merchantID") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banker" ADD CONSTRAINT "Banker_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_merchantID_fkey" FOREIGN KEY ("merchantID") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_merchantID_fkey" FOREIGN KEY ("merchantID") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_requesterID_fkey" FOREIGN KEY ("requesterID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_merchantID_fkey" FOREIGN KEY ("merchantID") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalData" ADD CONSTRAINT "FiscalData_merchantID_fkey" FOREIGN KEY ("merchantID") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditScore" ADD CONSTRAINT "CreditScore_merchantID_fkey" FOREIGN KEY ("merchantID") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditScoreBreakdown" ADD CONSTRAINT "CreditScoreBreakdown_scoringID_fkey" FOREIGN KEY ("scoringID") REFERENCES "CreditScore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRVerification" ADD CONSTRAINT "QRVerification_certID_fkey" FOREIGN KEY ("certID") REFERENCES "Certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
