import ResumeEditor from '@/components/ResumeEditor';
import CustomFormatUpload from '@/components/CustomFormatUpload';
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
        <h1 className="text-2xl font-bold text-slate-900">Base Resume</h1>
        <p className="mt-1 text-sm text-slate-500">
          Paste your full resume in Markdown. Use{' '}
          <code className="bg-slate-100 px-1 rounded text-slate-700">## Section</code> for sections
          (Summary, Experience, Skills, Education) and{' '}
          <code className="bg-slate-100 px-1 rounded text-slate-700">- </code> for bullets.
        </p>
      </div>
      <ResumeEditor initialContent={content} onSave={saveResume} />
      <CustomFormatUpload />
    </div>
  );
}
