-- TaxBridge CDC v2 - DB-level immutability + transaction audit trail
-- This complements API-level reversals by blocking physical deletes in PostgreSQL.

-- 1) NO DELETE policies (engine-level)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_rules
    WHERE schemaname = 'public' AND rulename = 'no_delete_transactions'
  ) THEN
    CREATE RULE no_delete_transactions AS
      ON DELETE TO "Transaction"
      DO INSTEAD NOTHING;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_rules
    WHERE schemaname = 'public' AND rulename = 'no_delete_audit_logs'
  ) THEN
    CREATE RULE no_delete_audit_logs AS
      ON DELETE TO "AuditLog"
      DO INSTEAD NOTHING;
  END IF;
END $$;

-- 2) Automatic audit entries for Transaction INSERT/UPDATE
CREATE OR REPLACE FUNCTION log_transaction_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_name TEXT;
  old_value_json TEXT;
  new_value_json TEXT;
  audit_id TEXT;
BEGIN
  action_name := TG_OP || '_TRANSACTION';
  old_value_json := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD)::text END;
  new_value_json := to_jsonb(NEW)::text;

  -- `AuditLog.id` is TEXT (cuid by app default); generate a unique text ID in SQL.
  audit_id := 'audit_' || substr(md5(random()::text || clock_timestamp()::text), 1, 24);

  INSERT INTO "AuditLog"(
    "id",
    "userID",
    "action",
    "resource",
    "resourceID",
    "status",
    "details",
    "createdAt"
  )
  VALUES (
    audit_id,
    NEW."userID",
    action_name,
    'Transaction',
    NEW."id",
    'SUCCESS',
    jsonb_build_object(
      'old_value', old_value_json,
      'new_value', new_value_json
    )::text,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'transaction_audit_trigger'
  ) THEN
    CREATE TRIGGER transaction_audit_trigger
    AFTER INSERT OR UPDATE ON "Transaction"
    FOR EACH ROW
    EXECUTE FUNCTION log_transaction_changes();
  END IF;
END $$;
