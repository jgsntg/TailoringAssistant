import fs from 'fs/promises';
import path from 'path';
import type { SavedTailoring } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const BASE_RESUME_PATH = path.join(DATA_DIR, 'base-resume.md');
const TAILORINGS_DIR = path.join(DATA_DIR, 'tailorings');

export async function getBaseResume(): Promise<string> {
  try {
    return await fs.readFile(BASE_RESUME_PATH, 'utf-8');
  } catch {
    return '';
  }
}

export async function saveBaseResume(content: string): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(BASE_RESUME_PATH, content, 'utf-8');
}

export async function listTailorings(): Promise<SavedTailoring[]> {
  try {
    const files = await fs.readdir(TAILORINGS_DIR);
    const tailorings = await Promise.all(
      files
        .filter((f) => f.endsWith('.json'))
        .map(async (f) => {
          const raw = await fs.readFile(path.join(TAILORINGS_DIR, f), 'utf-8');
          return JSON.parse(raw) as SavedTailoring;
        })
    );
    return tailorings.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch {
    return [];
  }
}

export async function getTailoring(id: string): Promise<SavedTailoring | null> {
  try {
    const raw = await fs.readFile(path.join(TAILORINGS_DIR, `${id}.json`), 'utf-8');
    return JSON.parse(raw) as SavedTailoring;
  } catch {
    return null;
  }
}

export async function saveTailoring(t: SavedTailoring): Promise<void> {
  await fs.mkdir(TAILORINGS_DIR, { recursive: true });
  await fs.writeFile(path.join(TAILORINGS_DIR, `${t.id}.json`), JSON.stringify(t, null, 2), 'utf-8');
}

export async function deleteTailoring(id: string): Promise<void> {
  await fs.unlink(path.join(TAILORINGS_DIR, `${id}.json`));
}
