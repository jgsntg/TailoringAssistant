import { z } from 'zod';
import { anthropic } from './anthropic';
import { SYSTEM_PROMPT } from '@/prompts/tailor-system-prompt';

export const TailoringResponseSchema = z.object({
  summary_revision: z
    .object({
      original: z.string(),
      revised: z.string(),
      rationale: z.string(),
    })
    .nullable(),
  bullet_revisions: z.array(
    z.object({
      section: z.string(),
      original: z.string(),
      revised: z.string(),
      rationale: z.string(),
    })
  ),
  suggested_additions: z.array(
    z.object({
      section: z.string(),
      suggested_bullet: z.string(),
      rationale: z.string(),
      requires_user_confirmation: z.string(),
    })
  ),
  keyword_gaps: z.array(z.string()),
});

export type TailoringResponse = z.infer<typeof TailoringResponseSchema>;

export async function tailorResume(
  resumeMd: string,
  jobText: string
): Promise<TailoringResponse> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
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
    .join('')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```\s*$/, '')
    .trim();

  const parsed = JSON.parse(text);
  return TailoringResponseSchema.parse(parsed);
}
