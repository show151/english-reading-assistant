export type PassageStatus = "draft" | "published" | "archived";
export type AnnotationType = "word" | "phrase" | "grammar" | "structure";
export type UserRole = "admin" | "learner";

export interface Passage {
  id: string;
  title: string;
  content: string;
  translation: string | null;
  summary: string | null;
  status: PassageStatus;
  created_at: string;
  updated_at: string;
}

export interface Paragraph {
  id: string;
  passage_id: string;
  paragraph_order: number;
  content: string;
  translation: string | null;
  summary: string | null;
}

export interface Annotation {
  id: string;
  passage_id: string;
  target_text: string;
  meaning: string;
  part_of_speech: string | null;
  type: AnnotationType;
  start_index: number;
  end_index: number;
  example: string | null;
  created_at: string;
}

export interface StudyHistory {
  id: string;
  user_id: string;
  passage_id: string;
  last_opened_at: string;
  reading_time: number;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface PassageWithDetails extends Passage {
  paragraphs: Paragraph[];
  annotations: Annotation[];
}

export interface AiAnalysisResult {
  translation: string;
  summary: string;
  paragraphs: Array<{
    translation: string;
    summary: string;
  }>;
  annotations: Array<{
    targetText: string;
    meaning: string;
    partOfSpeech?: string;
    type: AnnotationType;
    startIndex: number;
    endIndex: number;
    example?: string;
  }>;
}

export interface TextSegment {
  text: string;
  annotation?: Annotation;
}
