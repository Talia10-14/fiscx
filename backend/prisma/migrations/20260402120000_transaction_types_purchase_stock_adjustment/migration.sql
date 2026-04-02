-- SESSION 2 — stock movements: purchases & inventory adjustments
DO $$ BEGIN
  ALTER TYPE "TransactionType" ADD VALUE 'PURCHASE';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TYPE "TransactionType" ADD VALUE 'STOCK_ADJUSTMENT';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
