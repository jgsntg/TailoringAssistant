import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '@/prompts/tailor-system-prompt';
import { TailoringResponseSchema } from '@/lib/tailor';
import { extractJson } from './extract-json';
import type { LLMProvider } from './types';
import type { TailoringResponse } from '@/lib/types';

export class AnthropicProvider implements LLMProvider {
  readonly vendor = 'anthropic' as const;
  private client: Anthropic | null = null;

  constructor(
    public readonly id: string,
    public readonly displayName: string,
    private readonly modelIdentifier: string
  ) {}

  isAvailable(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async tailorResume(resumeMd: string, jobText: string): Promise<TailoringResponse> {
    if (!this.client) {
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    }

    const response = await this.client.messages.create({
      model: this.modelIdentifier,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `BASE RESUME:\n\`\`\`\n${resumeMd}\n\`\`\`\n\nTARGET JOB:\n\`\`\`\n${jobText}\n\`\`\`\n\nReturn the JSON now.`,
        },
      ],
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    const json = extractJson(text);
    return TailoringResponseSchema.parse(json);
  }
}
