import { exportToCustomDocx } from './customDocxExporter';
import type { ResumeData } from './types';

export async function exportToCustomPdf(data: ResumeData): Promise<Buffer> {
  const docxBuffer = await exportToCustomDocx(data);

  // libreoffice-convert has no @types package — use require with type assertion
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const libre = require('libreoffice-convert') as {
    convert: (buf: Buffer, ext: string, options: undefined, cb: (err: Error | null, result: Buffer) => void) => void;
  };

  return new Promise<Buffer>((resolve, reject) => {
    libre.convert(docxBuffer, '.pdf', undefined, (err, result) => {
      if (err) {
        if (err.message?.includes('LibreOffice')) {
          reject(new Error('Custom PDF export requires LibreOffice. Install it with: brew install libreoffice'));
        } else {
          reject(err);
        }
      } else {
        resolve(result);
      }
    });
  });
}
