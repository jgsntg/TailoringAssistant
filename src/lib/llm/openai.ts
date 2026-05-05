import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '@/prompts/tailor-system-prompt';
import { TailoringResponseSchema } from '@/lib/tailor';
import { extractJson } from './extract-json';
import type { LLMProvider } from './types';
import type { TailoringResponse } from '@/lib/types';

export class OpenAIProvider implements LLMProvider {
  readonly vendor = 'openai' as const;
  private client: OpenAI | null = null;

  constructor(
    public readonly id: string,
    public readonly displayName: string,
    private readonly modelIdentifier: string
  ) {}

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async tailorResume(resumeMd: string, jobText: string): Promise<TailoringResponse> {
    if (!this.client) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    }

    const response = await this.client.chat.completions.create({
      model: this.modelIdentifier,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `BASE RESUME:\n\`\`\`\n${resumeMd}\n\`\`\`\n\nTARGET JOB:\n\`\`\`\n${jobText}\n\`\`\`\n\nReturn the JSON now.`,
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? '';
    const json = extractJson(text);
    return TailoringResponseSchema.parse(json);
  }
}
