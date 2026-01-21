import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

async function testSignup() {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'Test123456';

  console.log('Testing signup with:', testEmail);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      console.error('❌ Signup failed:', error);
      process.exit(1);
    }

    console.log('✅ Signup successful!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');

    // Check if credits were initialized
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (creditsError) {
      console.warn(
        '⚠️  Credits not found (will be initialized on first access)',
      );
    } else {
      console.log('✅ Credits initialized:', credits);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

testSignup();
