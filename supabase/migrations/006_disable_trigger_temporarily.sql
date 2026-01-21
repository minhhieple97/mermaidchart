-- Temporarily disable the trigger to test signup
-- This will help us identify if the trigger is causing the issue

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
