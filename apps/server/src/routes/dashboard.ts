import { Router } from "express";
import { db, contacts, interactions } from "@crm/db";
import { DashboardData } from "@crm/shared";
import { desc, sql, eq } from "drizzle-orm";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;

    // 1. Get recent interactions (limit 10)
    const recentInteractionsRaw = await db
      .select({
        id: interactions.id,
        type: interactions.type,
        date: interactions.date,
        notes: interactions.notes,
        contactId: contacts.id,
        contactFirstName: contacts.firstName,
        contactLastName: contacts.lastName,
      })
      .from(interactions)
      .innerJoin(contacts, eq(interactions.contactId, contacts.id))
      .where(eq(interactions.userId, userId))
      .orderBy(desc(interactions.date))
      .limit(10);

    const recentInteractions = recentInteractionsRaw.map((row) => ({
      ...row,
      date: row.date.toISOString(),
    }));

    // 2. Get contacts needing follow up
    // A contact needs follow up if stay_in_touch_interval IS NOT NULL AND
    // ((last interaction date < NOW() - stay_in_touch_interval days) OR (no interactions and created_at < NOW() - stay_in_touch_interval days))
    
    // Using raw SQL for the having clause because Drizzle's aggregation API is tricky with intervals
    const overdueContactsRaw = await db.execute(sql`
      SELECT 
        c.id, 
        c.first_name as "firstName", 
        c.last_name as "lastName", 
        c.stay_in_touch_interval as "stayInTouchInterval",
        MAX(i.date) as "lastInteractionDate"
      FROM contacts c
      LEFT JOIN interactions i ON c.id = i.contact_id
      WHERE c.user_id = ${userId}::uuid
        AND c.stay_in_touch_interval IS NOT NULL
      GROUP BY c.id
      HAVING 
        (MAX(i.date) IS NOT NULL AND MAX(i.date) < NOW() - (c.stay_in_touch_interval * interval '1 day'))
        OR
        (MAX(i.date) IS NULL AND c.created_at < NOW() - (c.stay_in_touch_interval * interval '1 day'))
      ORDER BY "lastInteractionDate" ASC NULLS FIRST
    `);

    const needsFollowUp = overdueContactsRaw.rows.map((row: any) => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      stayInTouchInterval: row.stayInTouchInterval,
      lastInteractionDate: row.lastInteractionDate ? new Date(row.lastInteractionDate).toISOString() : null,
    }));

    const response: DashboardData = {
      needsFollowUp,
      recentInteractions,
    };

    return res.json(response);
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
