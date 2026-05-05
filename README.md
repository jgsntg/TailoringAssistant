# Resume Tailor

A local web app that tailors your resume to job postings using the Anthropic API. Paste a job URL or description, review AI-suggested changes one at a time, and copy the final Markdown resume.

## Setup

**1. Clone or copy this directory, then install dependencies:**

```bash
npm install
```

**2. Add your Anthropic API key:**

```bash
cp .env.example .env.local
# Edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...
```

**3. Start the dev server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal if 3000 is in use).

---

## Usage

### First time

1. Go to **Base Resume** in the nav
2. Paste your full resume in Markdown format
3. Click **Save**

### Tailoring a resume

1. Go to **New Tailoring**
2. Paste a job posting URL and click **Fetch** — or paste the job description directly
3. Click **Tailor my resume** and wait ~15 seconds
4. Review each suggested change:
   - **Reframes** (blue) — rewrites of existing bullets using job language. Accepted by default.
   - **Suggested additions** (amber) — new bullets you might add *if* you have that experience. Rejected by default.
5. Click **Show final resume** to see the assembled Markdown
6. **Copy markdown** to paste into your document tool, or **Save this version** to save it locally

### Viewing saved tailorings

The home page lists all saved tailorings. Click any row to view the final resume, or click **Delete** to remove it.

---

## Scraping notes

The scraper works best with:
- **Greenhouse** (`boards.greenhouse.io`)
- **Lever** (`jobs.lever.co`)
- **Ashby** (`jobs.ashbyhq.com`)
- **Workable** (`apply.workable.com`)
- **Stripe** (`stripe.com/jobs`)

**LinkedIn, Workday, and Indeed** block automated scraping — paste the job description manually for these.

If scraping fails for any other site, paste the job description text directly into the textarea.

---

## Data storage

All data is stored locally in `./data/` (gitignored):

- `data/base-resume.md` — your base resume
- `data/tailorings/*.json` — one file per saved tailoring

No database, no cloud storage, no accounts.

---

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- Anthropic SDK (`claude-sonnet-4-6`)
- cheerio (job scraping)
- zod (AI response validation)
