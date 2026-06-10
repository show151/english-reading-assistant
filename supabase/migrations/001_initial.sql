-- English Reading Assistant - Initial Schema

CREATE TYPE passage_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE annotation_type AS ENUM ('word', 'phrase', 'grammar', 'structure');
CREATE TYPE user_role AS ENUM ('admin', 'learner');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'learner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  translation TEXT,
  summary TEXT,
  level TEXT,
  genre TEXT,
  status passage_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE paragraphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id UUID NOT NULL REFERENCES passages(id) ON DELETE CASCADE,
  paragraph_order INT NOT NULL,
  content TEXT NOT NULL,
  translation TEXT,
  summary TEXT,
  UNIQUE (passage_id, paragraph_order)
);

CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id UUID NOT NULL REFERENCES passages(id) ON DELETE CASCADE,
  target_text TEXT NOT NULL,
  meaning TEXT NOT NULL,
  part_of_speech TEXT,
  type annotation_type NOT NULL DEFAULT 'word',
  start_index INT NOT NULL,
  end_index INT NOT NULL,
  example TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE study_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  passage_id UUID NOT NULL REFERENCES passages(id) ON DELETE CASCADE,
  last_opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reading_time INT NOT NULL DEFAULT 0,
  UNIQUE (user_id, passage_id)
);

CREATE INDEX idx_passages_status ON passages(status);
CREATE INDEX idx_paragraphs_passage_id ON paragraphs(passage_id);
CREATE INDEX idx_annotations_passage_id ON annotations(passage_id);
CREATE INDEX idx_study_history_user_id ON study_history(user_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER passages_updated_at
  BEFORE UPDATE ON passages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
