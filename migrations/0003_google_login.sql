ALTER TABLE users ADD COLUMN google_id TEXT;
CREATE UNIQUE INDEX users_google ON users(google_id);
