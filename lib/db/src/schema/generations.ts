import { pgTable, text, serial, timestamp, boolean, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const generationsTable = pgTable("generations", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  mode: varchar("mode", { length: 50 }).notNull(),
  voiceType: varchar("voice_type", { length: 20 }).notNull().default("preset"),
  voiceName: varchar("voice_name", { length: 100 }),
  audioFilename: varchar("audio_filename", { length: 255 }),
  isPublic: boolean("is_public").default(false),
  userId: varchar("user_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGenerationSchema = createInsertSchema(generationsTable).omit({ id: true, createdAt: true });
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type Generation = typeof generationsTable.$inferSelect;
