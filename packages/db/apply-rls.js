const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/crm",
});

async function run() {
  try {
    await pool.query("ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;");
    await pool.query("ALTER TABLE contacts FORCE ROW LEVEL SECURITY;");
    await pool.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM pg_policies
              WHERE tablename = 'contacts' AND policyname = 'contacts_user_isolation'
          ) THEN
              CREATE POLICY contacts_user_isolation ON contacts FOR ALL USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid);
          END IF;
      END
      $$;
    `);
    console.log("RLS applied successfully");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    pool.end();
  }
}

run();
