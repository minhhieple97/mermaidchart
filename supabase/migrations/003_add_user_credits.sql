-- Migration: Add user credits system for AI usage
-- Scalable design with transaction history for auditing and analytics

-- User credits balance table (denormalized for fast reads)
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 50 CHECK (balance >= 0),
  lifetime_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Credit transaction history for auditing and analytics
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Negative for usage, positive for additions
  balance_after INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'ai_fix', 'purchase', 'bonus', 'refund', 'initial'
  reference_id UUID, -- Optional: link to diagram_id or other entity
  metadata JSONB DEFAULT '{}', -- Extensible for future needs
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own credit data
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Function to initialize credits for new users (called via trigger or on first access)
CREATE OR REPLACE FUNCTION initialize_user_credits(p_user_id UUID)
RETURNS user_credits AS $$
DECLARE
  v_credits user_credits;
BEGIN
  INSERT INTO user_credits (user_id, balance)
  VALUES (p_user_id, 50)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING * INTO v_credits;
  
  -- If inserted, create initial transaction
  IF v_credits.user_id IS NOT NULL THEN
    INSERT INTO credit_transactions (user_id, amount, balance_after, transaction_type)
    VALUES (p_user_id, 50, 50, 'initial');
  ELSE
    SELECT * INTO v_credits FROM user_credits WHERE user_id = p_user_id;
  END IF;
  
  RETURN v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits atomically (prevents race conditions)
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR(50),
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Lock the row and get current balance
  SELECT balance INTO v_current_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check if user has credits record
  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'User credits not initialized'::TEXT;
    RETURN;
  END IF;
  
  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, v_current_balance, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;
  
  -- Deduct credits
  v_new_balance := v_current_balance - p_amount;
  
  UPDATE user_credits
  SET balance = v_new_balance,
      lifetime_used = lifetime_used + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, balance_after, transaction_type, reference_id, metadata)
  VALUES (p_user_id, -p_amount, v_new_balance, p_transaction_type, p_reference_id, p_metadata);
  
  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits (for purchases, bonuses, refunds)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR(50),
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER
) AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE user_credits
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  IF v_new_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, 0;
    RETURN;
  END IF;
  
  INSERT INTO credit_transactions (user_id, amount, balance_after, transaction_type, reference_id, metadata)
  VALUES (p_user_id, p_amount, v_new_balance, p_transaction_type, p_reference_id, p_metadata);
  
  RETURN QUERY SELECT TRUE, v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
