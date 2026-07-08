import { Router } from "express";
import { db, contacts } from "@crm/db";
import { ContactCreateSchema, ContactUpdateSchema } from "@crm/shared";
import { eq, desc, sql, ilike, or } from "drizzle-orm";

export const contactsRouter = Router();

contactsRouter.get("/", async (req, res) => {
  try {
    const q = req.query.q as string;
    let query = db.select().from(contacts).where(eq(contacts.userId, (req as any).userId));

    if (q) {
      // Fuzzy search using pg_trgm similarity or ilike fallback
      // Since we created gin_trgm_ops index, we can use similarity/ilike.
      // Drizzle doesn't have built-in similarity operator % yet, so we use sql`` or ilike
      query = db.select().from(contacts).where(
        sql`${contacts.userId} = ${(req as any).userId} AND (
          ${contacts.firstName} ILIKE ${'%' + q + '%'} OR 
          ${contacts.lastName} ILIKE ${'%' + q + '%'} OR
          ${contacts.firstName} % ${q} OR
          ${contacts.lastName} % ${q}
        )`
      );
    }

    const results = await query.orderBy(desc(contacts.createdAt));
    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

contactsRouter.post("/", async (req, res) => {
  try {
    const data = ContactCreateSchema.parse(req.body);
    const [newContact] = await db.insert(contacts).values({
      ...data,
      userId: (req as any).userId,
    }).returning();
    return res.status(201).json(newContact);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message || "Invalid input" });
  }
});

contactsRouter.get("/:id", async (req, res) => {
  try {
    const [contact] = await db.select().from(contacts).where(
      sql`${contacts.id} = ${req.params.id} AND ${contacts.userId} = ${(req as any).userId}`
    );
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    // In a real app we'd fetch interactions here too or in a separate endpoint
    return res.json(contact);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

contactsRouter.put("/:id", async (req, res) => {
  try {
    const data = ContactUpdateSchema.parse(req.body);
    const [updatedContact] = await db.update(contacts)
      .set(data)
      .where(sql`${contacts.id} = ${req.params.id} AND ${contacts.userId} = ${(req as any).userId}`)
      .returning();
      
    if (!updatedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    return res.json(updatedContact);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message || "Invalid input" });
  }
});
