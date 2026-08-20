CREATE TABLE IF NOT EXISTS checklists (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Geral',
  items TEXT NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY NOT NULL,
  checklist_id TEXT NOT NULL,
  answers TEXT NOT NULL,
  photos TEXT NOT NULL DEFAULT '{}',
  completed_at INTEGER NOT NULL
);
