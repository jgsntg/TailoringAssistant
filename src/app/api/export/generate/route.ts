import { parseResume } from '@/lib/exporters/markdown-parser';
import { exportToDocx } from '@/lib/exporters/docxExporter';
import { exportToPdf } from '@/lib/exporters/pdfExporter';
import { exportToCustomDocx } from '@/lib/exporters/customDocxExporter';
import { exportToCustomPdf } from '@/lib/exporters/customPdfExporter';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._\-\s]/g, '').replace(/\s+/g, '-').slice(0, 100);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { markdown, format, style, filename } = body as {
    markdown: string;
    format: 'docx' | 'pdf';
    style: string;
    filename: string;
  };

  if (!markdown || !format || !style || !filename) {
    return Response.json({ error: 'invalid_request', message: 'markdown, format, style, and filename are required.' }, { status: 400 });
  }

  const safeFilename = sanitizeFilename(filename);

  try {
    const data = parseResume(markdown);
    let buffer: Buffer;

    if (style === 'custom') {
      buffer = format === 'pdf' ? await exportToCustomPdf(data) : await exportToCustomDocx(data);
    } else {
      buffer = format === 'pdf' ? await exportToPdf(data, style) : await exportToDocx(data, style);
    }

    const contentType = format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (err) {
    console.error('[/api/export/generate]', err);
    return Response.json(
      { error: 'export_failed', message: err instanceof Error ? err.message : 'Export failed. Try again.' },
      { status: 500 }
    );
  }
}
