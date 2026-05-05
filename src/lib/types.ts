export type TailoringResponse = {
  summary_revision: {
    original: string;
    revised: string;
    rationale: string;
  } | null;
  bullet_revisions: Array<{
    section: string;
    original: string;
    revised: string;
    rationale: string;
  }>;
  suggested_additions: Array<{
    section: string;
    suggested_bullet: string;
    rationale: string;
    requires_user_confirmation: string;
  }>;
  keyword_gaps: string[];
};

export type SavedTailoring = {
  id: string;
  job_title: string;
  company: string;
  job_url?: string;
  job_text: string;
  base_resume_snapshot: string;
  tailored_resume: string;
  tailoring_response: TailoringResponse;
  accepted_change_ids: string[];
  created_at: string;
};

export type TailoringMeta = Pick<SavedTailoring, 'id' | 'job_title' | 'company' | 'created_at'>;
