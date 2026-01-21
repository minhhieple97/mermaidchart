import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Environment configuration with type-safe validation
 *
 * Supports both new Supabase API keys (sb_publishable_*, sb_secret_*)
 * and legacy keys (anon, service_role) for backward compatibility.
 *
 * See: https://github.com/orgs/supabase/discussions/29260
 */
export const env = createEnv({
  server: {
    // Supabase Secret Key (new format: sb_secret_*)
    // Falls back to legacy SUPABASE_SERVICE_ROLE_KEY if not set
    SUPABASE_SECRET_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

    // AI Provider Selection (default: google)
    AI_PROVIDER: z.enum(['google', 'openai', 'anthropic']).default('google'),

    // Google Gemini (default provider)
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),

    // OpenAI (optional)
    OPENAI_API_KEY: z.string().min(1).optional(),

    // Anthropic (optional)
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
  },
  client: {
    // Supabase URL
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),

    // Supabase Publishable Key (new format: sb_publishable_*)
    // Falls back to legacy NEXT_PUBLIC_SUPABASE_ANON_KEY if not set
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // AI
    AI_PROVIDER: process.env.AI_PROVIDER,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
});

export type AIProvider = 'google' | 'openai' | 'anthropic';

/**
 * Get the Supabase publishable key (client-side)
 * Supports both new (sb_publishable_*) and legacy (anon) formats
 */
export function getSupabasePublishableKey(): string {
  const key =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      'Missing Supabase publishable key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }
  return key;
}

/**
 * Get the Supabase secret key (server-side only)
 * Supports both new (sb_secret_*) and legacy (service_role) formats
 */
export function getSupabaseSecretKey(): string {
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'Missing Supabase secret key. Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY',
    );
  }
  return key;
}
