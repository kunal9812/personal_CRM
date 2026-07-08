import { z } from "zod";

export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const UserRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserRegister = z.infer<typeof UserRegisterSchema>;

export const ContactCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  stayInTouchInterval: z.number().int().positive().optional().nullable(),
});

export const ContactUpdateSchema = ContactCreateSchema.partial();

export const InteractionCreateSchema = z.object({
  type: z.enum(["call", "email", "meeting", "coffee", "other"]),
  date: z.string().optional().nullable().or(z.literal("")), // Allows empty string from input
  notes: z.string().optional().nullable(),
});

export const InteractionUpdateSchema = InteractionCreateSchema.partial();

export type ContactCreate = z.infer<typeof ContactCreateSchema>;
export type ContactUpdate = z.infer<typeof ContactUpdateSchema>;
export type InteractionCreate = z.infer<typeof InteractionCreateSchema>;
export type InteractionUpdate = z.infer<typeof InteractionUpdateSchema>;

export type DashboardContact = {
  id: string;
  firstName: string;
  lastName: string | null;
  stayInTouchInterval: number | null;
  lastInteractionDate: string | null;
};

export type DashboardInteraction = {
  id: string;
  type: string;
  date: string;
  notes: string | null;
  contactId: string;
  contactFirstName: string;
  contactLastName: string | null;
};

export type DashboardData = {
  needsFollowUp: DashboardContact[];
  recentInteractions: DashboardInteraction[];
};
