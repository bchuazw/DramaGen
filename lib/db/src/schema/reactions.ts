import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { generationsTable } from "./generations";

export const reactionsTable = pgTable("reactions", {
  id: serial("id").primaryKey(),
  generationId: integer("generation_id").references(() => generationsTable.id),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReactionSchema = createInsertSchema(reactionsTable).omit({ id: true, createdAt: true });
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactionsTable.$inferSelect;
