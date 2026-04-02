-- Hash chain persistence on transactions (CDC §6.5)
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "prevHash" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "hashChain" TEXT;

CREATE INDEX IF NOT EXISTS "Transaction_prevHash_idx" ON "Transaction"("prevHash");
CREATE INDEX IF NOT EXISTS "Transaction_hashChain_idx" ON "Transaction"("hashChain");
