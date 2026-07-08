import { Router } from "express";
import { db, interactions } from "@crm/db";
import { InteractionCreateSchema } from "@crm/shared";
import { desc, sql, eq } from "drizzle-orm";

export const interactionsRouter = Router({ mergeParams: true });

// Mounted at /api/contacts/:contactId/interactions
interactionsRouter.get("/", async (req, res) => {
  try {
    const contactId = (req.params as any).contactId;
    const userId = (req as any).userId;
    const results = await db.select().from(interactions).where(
      sql`${interactions.contactId} = ${contactId} AND ${interactions.userId} = ${userId}`
    ).orderBy(desc(interactions.date));
    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

interactionsRouter.post("/", async (req, res) => {
  try {
    const contactId = (req.params as any).contactId;
    const userId = (req as any).userId;
    const data = InteractionCreateSchema.parse(req.body);
    
    const [newInteraction] = await db.insert(interactions).values({
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
      userId: userId,
      contactId: contactId,
    }).returning();
    
    return res.status(201).json(newInteraction);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message || "Invalid input" });
  }
});

interactionsRouter.put("/:id", async (req, res) => {
  try {
    const contactId = (req.params as any).contactId;
    const userId = (req as any).userId;
    const id = req.params.id;
    // We import InteractionUpdateSchema dynamically to avoid issues if not imported at top
    // or we can import it at the top. Let's assume we can parse it from req.body directly since it's just partial.
    // Actually, I will import it at the top in a separate replace call.
    const data = req.body; 
    
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    
    const [updatedInteraction] = await db.update(interactions)
      .set(updateData)
      .where(sql`${interactions.id} = ${id} AND ${interactions.contactId} = ${contactId} AND ${interactions.userId} = ${userId}`)
      .returning();
      
    if (!updatedInteraction) {
      return res.status(404).json({ error: "Interaction not found" });
    }
    return res.json(updatedInteraction);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message || "Invalid input" });
  }
});

interactionsRouter.delete("/:id", async (req, res) => {
  try {
    const contactId = (req.params as any).contactId;
    const userId = (req as any).userId;
    const id = req.params.id;
    
    const [deletedInteraction] = await db.delete(interactions)
      .where(sql`${interactions.id} = ${id} AND ${interactions.contactId} = ${contactId} AND ${interactions.userId} = ${userId}`)
      .returning();
      
    if (!deletedInteraction) {
      return res.status(404).json({ error: "Interaction not found" });
    }
    return res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
