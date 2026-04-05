import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const presetVoicesTable = pgTable("preset_voices", {
  id: varchar("id", { length: 50 }).primaryKey(),
  elevenlabsVoiceId: varchar("elevenlabs_voice_id", { length: 100 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  emoji: varchar("emoji", { length: 10 }),
  previewFilename: varchar("preview_filename", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPresetVoiceSchema = createInsertSchema(presetVoicesTable).omit({ createdAt: true });
export type InsertPresetVoice = z.infer<typeof insertPresetVoiceSchema>;
export type PresetVoice = typeof presetVoicesTable.$inferSelect;
