import { getTemplate } from './templates';
import type { ResumeData } from './types';

export async function exportToDocx(data: ResumeData, templateId: string): Promise<Buffer> {
  const template = getTemplate(templateId);
  if (!template) throw new Error(`Unknown template: ${templateId}`);
  return await template.renderDocx(data);
}
