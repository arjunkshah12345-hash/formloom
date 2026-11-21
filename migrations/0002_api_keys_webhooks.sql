CREATE TABLE api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    preview TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_used_at INTEGER
  );
  CREATE TABLE webhook_deliveries (
    id TEXT PRIMARY KEY,
    form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    response_id TEXT NOT NULL,
    url TEXT NOT NULL,
    status INTEGER,
    error TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX webhook_deliveries_form ON webhook_deliveries(form_id, created_at DESC);
