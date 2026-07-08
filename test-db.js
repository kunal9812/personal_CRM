const { db, users } = require("./packages/db/dist/index.js");
const { eq } = require("drizzle-orm");

async function main() {
  try {
    const existing = await db.select().from(users).where(eq(users.email, "test@test.com"));
    console.log("Success:", existing);
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
