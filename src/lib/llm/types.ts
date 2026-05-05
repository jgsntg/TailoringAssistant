import type { TailoringResponse } from '@/lib/types';

export interface LLMProvider {
  readonly id: string;
  readonly displayName: string;
  readonly vendor: 'anthropic' | 'openai';
  isAvailable(): boolean;
  tailorResume(resumeMd: string, jobText: string): Promise<TailoringResponse>;
}
