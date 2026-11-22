import "server-only";

/**
 * The database, behind one small async interface so the same queries run on
 * two backends:
 *   - SQLite via node:sqlite when self-hosting (Docker, `pnpm start`)
 *   - Cloudflare D1 on the hosted version (FORMLOOM_RUNTIME=cloudflare)
 */
export type Param = string | number | null;

export interface Db {
  get<T>(sql: string, ...params: Param[]): Promise<T | undefined>;
  all<T>(sql: string, ...params: Param[]): Promise<T[]>;
  run(sql: string, ...params: Param[]): Promise<{ changes: number }>;
  /** Runs the statements atomically. */
  batch(statements: [sql: string, params: Param[]][]): Promise<void>;
}

export const onCloudflare = () => process.env.FORMLOOM_RUNTIME === "cloudflare";

/*
 * Schema history. The same SQL lives in /migrations for `wrangler d1 migrations apply`;
 * keep the two in step when adding a migration.
 */
const MIGRATIONS: string[] = [
  `
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
  `,
  `
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
  `,
  `
  ALTER TABLE users ADD COLUMN google_id TEXT;
  CREATE UNIQUE INDEX users_google ON users(google_id);
  `,
  `
  ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
  ALTER TABLE users ADD COLUMN plan_status TEXT;
  ALTER TABLE users ADD COLUMN plan_interval TEXT;
  ALTER TABLE users ADD COLUMN plan_period_end INTEGER;
  ALTER TABLE users ADD COLUMN plan_cancel_at_period_end INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
  ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
  CREATE INDEX users_stripe_customer ON users(stripe_customer_id);
  ALTER TABLE responses ADD COLUMN locked INTEGER NOT NULL DEFAULT 0;
  `,
];

// ---------------------------------------------------------------------------
// node:sqlite (self-hosted)

type SyncDb = import("node:sqlite").DatabaseSync;
const g = globalThis as unknown as { __formloomDb?: Promise<SyncDb> };

async function openSqlite(): Promise<SyncDb> {
  const [{ DatabaseSync }, fs, path] = await Promise.all([
    import(/* webpackIgnore: true */ "node:sqlite"),
    import("node:fs"),
    import("node:path"),
  ]);
  const file =
    process.env.DATABASE_PATH ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "formloom.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  const row = db.prepare("PRAGMA user_version").get() as { user_version: number };
  for (let v = row.user_version; v < MIGRATIONS.length; v++) {
    db.exec("BEGIN");
    try {
      db.exec(MIGRATIONS[v]);
      db.exec(`PRAGMA user_version = ${v + 1}`);
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
  return db;
}

function sqliteDb(d: SyncDb): Db {
  return {
    async get<T>(sql: string, ...params: Param[]) {
      return d.prepare(sql).get(...params) as T | undefined;
    },
    async all<T>(sql: string, ...params: Param[]) {
      return d.prepare(sql).all(...params) as T[];
    },
    async run(sql: string, ...params: Param[]) {
      return { changes: Number(d.prepare(sql).run(...params).changes) };
    },
    async batch(statements) {
      d.exec("BEGIN");
      try {
        for (const [sql, params] of statements) d.prepare(sql).run(...params);
        d.exec("COMMIT");
      } catch (e) {
        d.exec("ROLLBACK");
        throw e;
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Cloudflare D1 (hosted)

interface D1Statement {
  bind(...params: Param[]): D1Statement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}
interface D1 {
  prepare(sql: string): D1Statement;
  batch(statements: D1Statement[]): Promise<unknown>;
}

function d1Db(d: D1): Db {
  return {
    async get<T>(sql: string, ...params: Param[]) {
      return (await d.prepare(sql).bind(...params).first<T>()) ?? undefined;
    },
    async all<T>(sql: string, ...params: Param[]) {
      return (await d.prepare(sql).bind(...params).all<T>()).results;
    },
    async run(sql: string, ...params: Param[]) {
      return { changes: (await d.prepare(sql).bind(...params).run()).meta.changes };
    },
    async batch(statements) {
      if (statements.length) await d.batch(statements.map(([sql, params]) => d.prepare(sql).bind(...params)));
    },
  };
}

/** Cloudflare bindings (D1 database, KV for uploads), only on the hosted version. */
export async function cloudflareEnv(): Promise<{ DB: D1; UPLOADS: CloudflareKV }> {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  return (await getCloudflareContext({ async: true })).env as unknown as { DB: D1; UPLOADS: CloudflareKV };
}

export interface CloudflareKV {
  get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
  getWithMetadata<M>(key: string, type: "arrayBuffer"): Promise<{ value: ArrayBuffer | null; metadata: M | null }>;
  put(key: string, value: ArrayBuffer, options?: { metadata?: unknown }): Promise<void>;
}

export async function db(): Promise<Db> {
  if (onCloudflare()) return d1Db((await cloudflareEnv()).DB);
  g.__formloomDb ??= openSqlite();
  return sqliteDb(await g.__formloomDb);
}
