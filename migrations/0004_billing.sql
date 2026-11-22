ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN plan_status TEXT;
ALTER TABLE users ADD COLUMN plan_interval TEXT;
ALTER TABLE users ADD COLUMN plan_period_end INTEGER;
ALTER TABLE users ADD COLUMN plan_cancel_at_period_end INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
CREATE INDEX users_stripe_customer ON users(stripe_customer_id);
ALTER TABLE responses ADD COLUMN locked INTEGER NOT NULL DEFAULT 0;
