const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:Kunal%402409@localhost:5401/postgres",
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Enabling pg_trgm extension...");
    await client.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    console.log("Creating GIN index for fuzzy search on contacts...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS contacts_name_trgm_idx 
      ON contacts USING gin (first_name gin_trgm_ops, last_name gin_trgm_ops);
    `);

    console.log("Enabling RLS on interactions table...");
    await client.query(`ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;`);

    // Check if policy exists and create if it doesn't
    const res = await client.query(`
      SELECT policyname 
      FROM pg_policies 
      WHERE tablename = 'interactions' AND policyname = 'interactions_isolation_policy';
    `);

    if (res.rowCount === 0) {
      console.log("Creating RLS policy for interactions...");
      await client.query(`
        CREATE POLICY interactions_isolation_policy ON interactions
        USING (user_id = current_setting('app.current_user_id')::uuid)
        WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);
      `);
    } else {
      console.log("RLS policy for interactions already exists.");
    }

    console.log("Successfully applied RLS and indexes.");
  } catch (err) {
    console.error("Error applying RLS:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
