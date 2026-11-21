CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE forms (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    draft TEXT NOT NULL,
    published TEXT,
    published_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX forms_user ON forms(user_id, updated_at DESC);
  CREATE TABLE responses (
    id TEXT PRIMARY KEY,
    form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    answers TEXT NOT NULL,
    hidden TEXT NOT NULL DEFAULT '{}',
    meta TEXT NOT NULL DEFAULT '{}',
    ending_id TEXT,
    started_at INTEGER,
    submitted_at INTEGER NOT NULL,
    duration_ms INTEGER
  );
  CREATE INDEX responses_form ON responses(form_id, submitted_at DESC);
  CREATE TABLE events (
    form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    visitor TEXT NOT NULL,
    type TEXT NOT NULL,
    field_id TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    PRIMARY KEY (form_id, visitor, type, field_id)
  );
