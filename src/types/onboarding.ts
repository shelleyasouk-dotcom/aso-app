// ─── Content block types ──────────────────────────────────────────────────────

export interface BaseBlock { id: string; order: number; type: string }

export interface HeadingBlock       extends BaseBlock { type: 'heading';          level: 1|2|3; text: string }
export interface ParagraphBlock     extends BaseBlock { type: 'paragraph';        text: string }
export interface BulletListBlock    extends BaseBlock { type: 'bullet_list';      items: string[] }
export interface NumberedListBlock  extends BaseBlock { type: 'numbered_list';    items: string[] }
export interface ImageBlock         extends BaseBlock { type: 'image';            url: string; alt?: string; caption?: string }
export interface VideoBlock         extends BaseBlock { type: 'video';            url: string; caption?: string }
export interface CalloutBlock       extends BaseBlock { type: 'callout';          variant: 'info'|'warning'|'important'|'tip'; title?: string; text: string }
export interface DownloadableBlock  extends BaseBlock { type: 'downloadable_file'; url: string; filename: string; label?: string }
export interface DividerBlock       extends BaseBlock { type: 'divider' }
export interface ScenarioBlock      extends BaseBlock { type: 'scenario';         title?: string; context: string; question?: string }
export interface AcknowledgementBlock extends BaseBlock { type: 'acknowledgement'; prompt: string }
export interface CtaButtonBlock     extends BaseBlock { type: 'cta_button';    label: string; route: string }

export type ContentBlock =
  | HeadingBlock | ParagraphBlock | BulletListBlock | NumberedListBlock
  | ImageBlock | VideoBlock | CalloutBlock | DownloadableBlock
  | DividerBlock | ScenarioBlock | AcknowledgementBlock | CtaButtonBlock
// Note: ContentJson.blocks may contain future unknown types at runtime.
// The renderer's default case handles them gracefully; TypeScript trusts the cast.

export interface ContentJson {
  version: number
  blocks: ContentBlock[]
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface OnboardingTask {
  id: string
  stage_id: string
  title: string
  type: 'content' | 'quiz' | 'upload' | 'declaration' | 'contract' | 'placement'
  display_order: number
  is_mandatory: boolean
  version: number
  // content
  content_json: ContentJson | null
  // quiz
  pass_threshold_pct: number | null
  questions_per_attempt: number | null
  max_attempts: number | null
  retry_delay_seconds: number
  show_correct_answers: boolean
  // upload
  required_doc_category: string | null
  required_doc_label: string | null
  requires_expiry_date: boolean
  requires_issue_date: boolean
  requires_provider: boolean
  requires_cert_number: boolean
  requires_completion_date: boolean
  requires_approval: boolean
  allowed_file_types: string[]
  max_file_size_mb: number
  // declaration
  declaration_text: string | null
  requires_typed_name: boolean
}

// ─── Task assignment ──────────────────────────────────────────────────────────

export interface OnboardingTaskAssignment {
  id: string
  enrollment_id: string
  task_id: string
  task_version: number
  status: string
  started_at: string | null
  completed_at: string | null
  best_score_pct: number | null
  attempts: number
  last_attempted_at: string | null
  document_id: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  declaration_name: string | null
  declaration_signed_at: string | null
  declaration_version: number | null
  content_version_completed: number | null
  progress_data: Record<string, unknown> | null
}

// ─── Enrollment ───────────────────────────────────────────────────────────────

export interface OnboardingEnrollment {
  id: string
  status: string
  learning_completion_pct: number
}

// ─── Quiz RPC responses ───────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  category_tag: string | null
}

export interface DrawQuizResult {
  attempt_id: string
  resumed: boolean
  questions: QuizQuestion[]
}

export interface QuizFeedbackItem {
  question_id: string
  question: string
  correct: boolean
  explanation: string | null
  correct_option: string | null
  selected_option: string | null
}

export interface SubmitQuizResult {
  score: number
  max_score: number
  score_pct: number
  passed: boolean
  attempt_number: number
  can_retry: boolean
  retry_after_seconds: number
  feedback: QuizFeedbackItem[]
}

// ─── Shared task component props ──────────────────────────────────────────────

export interface TaskComponentProps {
  task: OnboardingTask
  assignment: OnboardingTaskAssignment
  enrollment: OnboardingEnrollment
  profileName: string
  profileId: string
  onComplete: () => void
  onRefresh: () => void
}
