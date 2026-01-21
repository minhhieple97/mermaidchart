-- Migration: Fix credit initialization trigger
-- Remove the ON CONFLICT clause from credit_transactions insert

-- Drop and recreate the trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert credits record (idempotent)
  INSERT INTO user_credits (user_id, balance)
  VALUES (NEW.id, 50)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Only create transaction if credits were just created
  IF NOT EXISTS (
    SELECT 1 FROM credit_transactions 
    WHERE user_id = NEW.id AND transaction_type = 'initial'
  ) THEN
    INSERT INTO credit_transactions (user_id, amount, balance_after, transaction_type)
    VALUES (NEW.id, 50, 50, 'initial');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
