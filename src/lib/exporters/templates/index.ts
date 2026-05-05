import { classicTemplate } from './classic';
import { modernTemplate } from './modern';
import { techTemplate } from './tech';
import type { Template } from '../types';

export const TEMPLATES: Template[] = [classicTemplate, modernTemplate, techTemplate];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
