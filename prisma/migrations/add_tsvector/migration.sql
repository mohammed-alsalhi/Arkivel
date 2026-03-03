-- Enable pg_trgm for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add tsvector column
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS "Article_searchVector_idx" ON "Article" USING GIN ("searchVector");

-- Create trigram index on title for fuzzy matching
CREATE INDEX IF NOT EXISTS "Article_title_trgm_idx" ON "Article" USING GIN (title gin_trgm_ops);

-- Create trigger to auto-update search vector
CREATE OR REPLACE FUNCTION update_article_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', regexp_replace(COALESCE(NEW.content, ''), '<[^>]*>', ' ', 'g')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS article_search_vector_update ON "Article";
CREATE TRIGGER article_search_vector_update
BEFORE INSERT OR UPDATE OF title, content, excerpt ON "Article"
FOR EACH ROW EXECUTE FUNCTION update_article_search_vector();

-- Backfill existing articles
UPDATE "Article" SET "searchVector" =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', regexp_replace(COALESCE(content, ''), '<[^>]*>', ' ', 'g')), 'C');
