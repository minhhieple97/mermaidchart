/**
 * AI Provider Abstraction
 *
 * Scalable AI provider setup that supports multiple providers:
 * - Google Gemini (default) - gemini-2.0-flash-exp
 * - OpenAI - gpt-4o-mini
 * - Anthropic - claude-3-haiku
 *
 * Easy to extend: just add a new provider config and update the switch statement
 */

import { env, type AIProvider } from '@/env';

// Provider-specific model configurations
export const AI_MODELS = {
  google: {
    default: 'gemini-2.0-flash-exp',
    fast: 'gemini-2.0-flash-exp',
    powerful: 'gemini-1.5-pro',
  },
  openai: {
    default: 'gpt-4o-mini',
    fast: 'gpt-4o-mini',
    powerful: 'gpt-4o',
  },
  anthropic: {
    default: 'claude-3-haiku-20240307',
    fast: 'claude-3-haiku-20240307',
    powerful: 'claude-3-5-sonnet-20241022',
  },
} as const;

export type ModelTier = 'default' | 'fast' | 'powerful';

/**
 * Get the current AI provider from environment
 */
export function getAIProvider(): AIProvider {
  return env.AI_PROVIDER;
}

/**
 * Get the model ID for the current provider and tier
 */
export function getModelId(tier: ModelTier = 'default'): string {
  const provider = getAIProvider();
  return AI_MODELS[provider][tier];
}

/**
 * Get the configured AI model instance for use with Vercel AI SDK
 * Returns the appropriate model based on AI_PROVIDER env variable
 */
export async function getAIModel(tier: ModelTier = 'default') {
  const provider = getAIProvider();
  const modelId = getModelId(tier);

  switch (provider) {
    case 'google': {
      const { google } = await import('@ai-sdk/google');
      return google(modelId);
    }
    case 'openai': {
      const { openai } = await import('@ai-sdk/openai');
      return openai(modelId);
    }
    case 'anthropic': {
      const { anthropic } = await import('@ai-sdk/anthropic');
      return anthropic(modelId);
    }
    default: {
      // Fallback to Google
      const { google } = await import('@ai-sdk/google');
      return google(AI_MODELS.google.default);
    }
  }
}

/**
 * Check if the required API key is configured for the current provider
 */
export function isAIConfigured(): boolean {
  const provider = getAIProvider();

  switch (provider) {
    case 'google':
      return !!env.GOOGLE_GENERATIVE_AI_API_KEY;
    case 'openai':
      return !!env.OPENAI_API_KEY;
    case 'anthropic':
      return !!env.ANTHROPIC_API_KEY;
    default:
      return false;
  }
}
