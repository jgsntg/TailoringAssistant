import { AnthropicProvider } from './anthropic';
import { OpenAIProvider } from './openai';
import type { LLMProvider } from './types';

// Model identifiers confirmed against live APIs on 2026-05-05:
// Anthropic: claude-sonnet-4-6, claude-opus-4-7
// OpenAI: gpt-5.4-mini, gpt-5.4, gpt-5.5
export const ALL_PROVIDERS: LLMProvider[] = [
  new AnthropicProvider('anthropic-sonnet', 'Claude Sonnet 4.6', 'claude-sonnet-4-6'),
  new AnthropicProvider('anthropic-opus', 'Claude Opus 4.7', 'claude-opus-4-7'),
  new OpenAIProvider('openai-gpt54-mini', 'GPT-5.4 mini', 'gpt-5.4-mini'),
  new OpenAIProvider('openai-gpt54', 'GPT-5.4', 'gpt-5.4'),
  new OpenAIProvider('openai-gpt55', 'GPT-5.5', 'gpt-5.5'),
];

export function getAvailableProviders(): LLMProvider[] {
  return ALL_PROVIDERS.filter((p) => p.isAvailable());
}

export function getProvider(id: string): LLMProvider | undefined {
  return ALL_PROVIDERS.find((p) => p.id === id);
}
