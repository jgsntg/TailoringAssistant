import { load } from 'cheerio';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

type ScrapeResult = {
  jobText: string;
  jobTitle?: string;
  company?: string;
};

class ScrapeError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

function detectAts(url: string): string {
  if (url.includes('linkedin.com/jobs')) return 'linkedin';
  if (url.includes('myworkdayjobs.com') || url.includes('workday.com')) return 'workday';
  if (url.includes('indeed.com')) return 'indeed';
  if (url.includes('boards.greenhouse.io') || url.includes('.greenhouse.io')) return 'greenhouse';
  if (url.includes('jobs.lever.co')) return 'lever';
  if (url.includes('jobs.ashbyhq.com')) return 'ashby';
  if (url.includes('apply.workable.com')) return 'workable';
  if (url.includes('stripe.com/jobs')) return 'stripe';
  return 'generic';
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function extractCompanyFromPath(url: string): string {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    return parts[0] ?? '';
  } catch {
    return '';
  }
}

function validateText(text: string): void {
  if (text.length < 500) {
    throw new ScrapeError(
      'The page returned too little text — it may require JavaScript. Please paste the description manually.'
    );
  }
  const lower = text.toLowerCase();
  if (lower.includes('please enable javascript') || lower.includes('javascript is required')) {
    throw new ScrapeError(
      'This page requires JavaScript to render. Please paste the job description manually.'
    );
  }
  if (lower.includes('are you a robot') || lower.includes('captcha')) {
    throw new ScrapeError(
      'The page returned a CAPTCHA challenge. Please paste the job description manually.'
    );
  }
  const keywords = ['responsibilities', 'requirements', 'qualifications', 'experience', 'skills'];
  if (!keywords.some((k) => lower.includes(k))) {
    throw new ScrapeError(
      'The page does not appear to contain a job description. Please paste the text manually.'
    );
  }
}

export async function scrapeJob(url: string): Promise<ScrapeResult> {
  const ats = detectAts(url);

  if (ats === 'linkedin') {
    throw new ScrapeError(
      'LinkedIn blocks automated scraping. Please paste the job description manually.'
    );
  }
  if (ats === 'workday') {
    throw new ScrapeError(
      'Workday job pages load via JavaScript. Please paste the job description manually.'
    );
  }
  if (ats === 'indeed') {
    throw new ScrapeError(
      'Indeed blocks automated scraping. Please paste the job description manually.'
    );
  }

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!res.ok) {
    throw new ScrapeError(`Failed to fetch the page (HTTP ${res.status}). Please paste the job description manually.`);
  }

  const html = await res.text();
  const $ = load(html);

  $('script, style, nav, footer, header, [role="navigation"]').remove();

  let jobTitle: string | undefined;
  let company: string | undefined;
  let jobText = '';

  if (ats === 'greenhouse') {
    jobTitle = $('.app-title, h1').first().text().trim() || undefined;
    jobText = cleanText($('#content, .section-wrapper').first().text());
    company = $('.company-name').first().text().trim() || extractCompanyFromPath(url) || undefined;
  } else if (ats === 'lever') {
    jobTitle = $('.posting-headline h2').first().text().trim() || undefined;
    jobText = cleanText($('.posting-page, .section-wrapper').first().text());
    company = extractCompanyFromPath(url) || undefined;
  } else if (ats === 'ashby') {
    jobTitle = $('h1').first().text().trim() || undefined;
    jobText = cleanText($('.JobPosting__description').first().text());
    company = extractCompanyFromPath(url) || undefined;
  } else if (ats === 'workable') {
    jobTitle = $('h1').first().text().trim() || undefined;
    jobText = cleanText($('[data-ui="job-description"]').first().text());
    company = extractCompanyFromPath(url) || undefined;
  } else if (ats === 'stripe') {
    jobTitle = $('h1').first().text().trim() || undefined;
    jobText = cleanText($('main').first().text());
    company = 'Stripe';
  } else {
    jobTitle = $('h1').first().text().trim() || undefined;
    jobText =
      cleanText($('main').first().text()) ||
      cleanText($('article').first().text()) ||
      cleanText($('body').text());
    company =
      $('meta[property="og:site_name"]').attr('content')?.trim() ||
      extractCompanyFromPath(url) ||
      undefined;
  }

  validateText(jobText);

  return { jobText, jobTitle: jobTitle || undefined, company: company || undefined };
}
