import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:Kunal%402409@localhost:5401/postgres",
});

export const db = drizzle(pool, { schema });

export async function withUserContext<T>(userId: string, fn: (tx: any) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_user_id', ${userId}, true)`);
    return fn(tx);
  });
}

export * from "./schema";
