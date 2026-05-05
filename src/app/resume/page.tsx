import ResumeEditor from '@/components/ResumeEditor';
import { getBaseResume } from '@/lib/storage';

async function saveResume(content: string) {
  'use server';
  const { saveBaseResume } = await import('@/lib/storage');
  await saveBaseResume(content);
}

export default async function ResumePage() {
  const content = await getBaseResume();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Base Resume</h1>
        <p className="mt-1 text-sm text-gray-500">
          Paste your full resume in Markdown. Use <code className="bg-gray-100 px-1 rounded">## Section</code> for
          sections (Summary, Experience, Skills, Education) and{' '}
          <code className="bg-gray-100 px-1 rounded">- </code> for bullets.
        </p>
      </div>
      <ResumeEditor initialContent={content} onSave={saveResume} />
    </div>
  );
}
