ALTER TABLE responses ADD COLUMN extra_items text NOT NULL DEFAULT '[]';
ALTER TABLE responses ADD COLUMN updated_at integer;