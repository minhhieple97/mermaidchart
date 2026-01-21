-- Fix RLS policies for user_credits to allow trigger to insert
-- The issue is that the trigger runs with SECURITY DEFINER but RLS is still enforced

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to insert (for trigger)
CREATE POLICY "Service role can insert credits" ON user_credits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to insert (for trigger)
CREATE POLICY "Service role can insert transactions" ON credit_transactions
  FOR INSERT WITH CHECK (true);

-- Recreate the trigger with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert credits record (idempotent)
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.id, 50)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Only create transaction if credits were just created
  IF NOT EXISTS (
    SELECT 1 FROM public.credit_transactions 
    WHERE user_id = NEW.id AND transaction_type = 'initial'
  ) THEN
    INSERT INTO public.credit_transactions (user_id, amount, balance_after, transaction_type)
    VALUES (NEW.id, 50, 50, 'initial');
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail user creation
  RAISE WARNING 'Failed to initialize credits for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
