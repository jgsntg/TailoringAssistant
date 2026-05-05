export type ResumeData = {
  name: string;
  contact: string;
  headline?: string;
  sections: ResumeSection[];
};

export type ResumeSection = {
  title: string;
  type: 'paragraph' | 'bullets' | 'experience' | 'inline-list';
  content: ResumeContent;
};

export type ResumeContent =
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'experience'; entries: ExperienceEntry[] }
  | { type: 'inline-list'; items: string[] };

export type ExperienceEntry = {
  heading: string;
  bullets: string[];
};

export type ExportFormat = 'docx' | 'pdf';
export type ExportStyleId = 'classic' | 'modern' | 'tech' | 'custom';

export type Template = {
  id: string;
  displayName: string;
  description: string;
  renderHtml(data: ResumeData): string;
  renderDocx(data: ResumeData): Promise<Buffer>;
};
