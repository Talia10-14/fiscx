-- FiscX — PostgreSQL Initialization Script
-- Phase 0: Database Setup

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS fiscx;
CREATE SCHEMA IF NOT EXISTS audit;

-- Set search path
SET search_path TO fiscx, audit, public;

-- ========== CORE TABLES ==========

-- Users (all roles)
CREATE TABLE fiscx.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email CITEXT UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  pin_hash VARCHAR(255),
  device_uuid UUID,
  
  role VARCHAR(50) NOT NULL,
  profile_type VARCHAR(50) NOT NULL CHECK (profile_type IN ('merchant', 'accountant', 'banker', 'regulator', 'admin', 'kyc')),
  
  full_name VARCHAR(255),
  business_name VARCHAR(255),
  country_code VARCHAR(2) DEFAULT 'BJ',
  
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  phone_verified_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Transactions (sales & expenses)
CREATE TABLE fiscx.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES fiscx.users(id),
  
  type VARCHAR(50) NOT NULL CHECK (type IN ('sale', 'expense')),
  category VARCHAR(100),
  description VARCHAR(500),
  
  amount BIGINT NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'XOF',
  
  transaction_date DATE NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  receipt_image_url VARCHAR(500),
  receipt_checksum VARCHAR(64),
  
  sync_status VARCHAR(50) DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'error')),
  sync_error_message TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- NO DELETE on transactions (compliance)

-- Stock Management
CREATE TABLE fiscx.stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES fiscx.users(id),
  
  product_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  
  quantity_current INT NOT NULL DEFAULT 0,
  quantity_min INT DEFAULT 5,
  quantity_max INT,
  
  unit_price BIGINT,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  
  sku VARCHAR(100),
  barcode VARCHAR(100),
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log (immutable)
CREATE TABLE audit.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES fiscx.users(id),
  
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- NO DELETE on audit_logs
ALTER TABLE audit.audit_logs ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- ========== FISCAL TABLES ==========

-- Tax Calculations (Taxe Synthétique)
CREATE TABLE fiscx.tax_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES fiscx.users(id),
  
  fiscal_year INT NOT NULL,
  fiscal_period VARCHAR(50),
  
  total_revenue BIGINT NOT NULL DEFAULT 0,
  total_expenses BIGINT NOT NULL DEFAULT 0,
  net_profit BIGINT NOT NULL DEFAULT 0,
  
  tax_rate DECIMAL(5, 2),
  tax_due BIGINT NOT NULL DEFAULT 0,
  tax_paid BIGINT DEFAULT 0,
  
  regime VARCHAR(50) CHECK (regime IN ('ts', 'rrs', 'normal', 'exonerated')),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'declared', 'paid')),
  
  calculated_at TIMESTAMP,
  declared_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== BANKING TABLES ==========

-- Credit Score
CREATE TABLE fiscx.credit_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES fiscx.users(id),
  
  score_value INT NOT NULL CHECK (score_value >= 0 AND score_value <= 1000),
  
  avg_revenue_30d BIGINT,
  regularity_score DECIMAL(5, 2),
  cancellation_rate DECIMAL(5, 2),
  tenure_days INT,
  product_diversity INT,
  
  bic_compliant BOOLEAN DEFAULT TRUE,
  
  calculated_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan Requests
CREATE TABLE fiscx.loan_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES fiscx.users(id),
  bank_id UUID REFERENCES fiscx.users(id),
  
  amount_requested BIGINT NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  
  purpose VARCHAR(255),
  duration_months INT,
  
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
  
  consent_granted BOOLEAN DEFAULT FALSE,
  consent_granted_at TIMESTAMP,
  
  banker_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== INDEXES ==========

CREATE INDEX idx_transactions_user_date ON fiscx.transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_type ON fiscx.transactions(type);
CREATE INDEX idx_stock_user ON fiscx.stock_items(user_id, is_active);
CREATE INDEX idx_credit_scores_user ON fiscx.credit_scores(user_id);
CREATE INDEX idx_loan_requests_user ON fiscx.loan_requests(user_id);
CREATE INDEX idx_loan_requests_bank ON fiscx.loan_requests(bank_id);
CREATE INDEX idx_audit_logs_user ON audit.audit_logs(user_id, created_at);

GRANT CONNECT ON DATABASE fiscx_dev TO fiscx;
GRANT USAGE ON SCHEMA fiscx, audit TO fiscx;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA fiscx TO fiscx;
GRANT SELECT ON ALL TABLES IN SCHEMA audit TO fiscx;
