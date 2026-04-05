import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { generationsTable, reactionsTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import {
  GetGalleryQueryParams,
  SaveToGalleryBody,
  SaveToGalleryResponse,
  ReactToGalleryParams,
  ReactToGalleryBody,
  ReactToGalleryResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/gallery", async (req, res): Promise<void> => {
  const parsed = GetGalleryQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;
  const offset = parsed.success ? (parsed.data.offset ?? 0) : 0;

  const entries = await db
    .select()
    .from(generationsTable)
    .where(eq(generationsTable.isPublic, true))
    .orderBy(desc(generationsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const totalResult = await db
    .select({ count: count() })
    .from(generationsTable)
    .where(eq(generationsTable.isPublic, true));
  const total = totalResult[0]?.count ?? 0;

  const entriesWithReactions = await Promise.all(
    entries.map(async (entry) => {
      const reactions = await db
        .select({ emoji: reactionsTable.emoji, count: count() })
        .from(reactionsTable)
        .where(eq(reactionsTable.generationId, entry.id))
        .groupBy(reactionsTable.emoji);

      const reactionMap: Record<string, number> = {};
      for (const r of reactions) {
        reactionMap[r.emoji] = Number(r.count);
      }

      return {
        id: entry.id,
        original_text: entry.originalText,
        translated_text: entry.translatedText,
        mode: entry.mode,
        voice_type: entry.voiceType,
        voice_name: entry.voiceName ?? undefined,
        audio_url: entry.audioFilename ? `/api/audio/${entry.audioFilename}` : "",
        reactions: reactionMap,
        created_at: entry.createdAt.toISOString(),
      };
    })
  );

  res.json({ entries: entriesWithReactions, total: Number(total) });
});

router.post("/gallery", async (req, res): Promise<void> => {
  const parsed = SaveToGalleryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", message: parsed.error.message });
    return;
  }

  const { generation_id } = parsed.data;

  const [updated] = await db
    .update(generationsTable)
    .set({ isPublic: true })
    .where(eq(generationsTable.id, generation_id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Generation not found" });
    return;
  }

  const response = SaveToGalleryResponse.parse({
    id: updated.id,
    original_text: updated.originalText,
    translated_text: updated.translatedText,
    mode: updated.mode,
    voice_type: updated.voiceType,
    voice_name: updated.voiceName ?? undefined,
    audio_url: updated.audioFilename ? `/api/audio/${updated.audioFilename}` : "",
    reactions: {},
    created_at: updated.createdAt.toISOString(),
  });

  res.json(response);
});

router.post("/gallery/:id/react", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ReactToGalleryParams.safeParse({ id: parseInt(rawId ?? "0", 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const body = ReactToGalleryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid emoji" });
    return;
  }

  const { emoji } = body.data;

  await db.insert(reactionsTable).values({
    generationId: params.data.id,
    emoji,
  });

  const response = ReactToGalleryResponse.parse({ success: true, emoji });
  res.json(response);
});

export default router;
