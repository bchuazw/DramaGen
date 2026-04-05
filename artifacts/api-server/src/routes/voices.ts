import { Router, type IRouter } from "express";
import multer from "multer";
import { db } from "@workspace/db";
import { presetVoicesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { cloneVoice, VOICE_PRESETS, designAndSaveVoice } from "../services/elevenlabs";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.get("/voices/presets", async (req, res): Promise<void> => {
  const presets = await db.select().from(presetVoicesTable);

  const voices = VOICE_PRESETS.map((preset) => {
    const stored = presets.find((p) => p.id === preset.id);
    return {
      id: preset.id,
      voice_id: stored?.elevenlabsVoiceId ?? null,
      name: preset.name,
      description: preset.description,
      emoji: preset.emoji,
      ready: !!stored?.elevenlabsVoiceId,
    };
  });

  res.json({ voices });
});

router.post("/voice/clone", requireAuth, upload.single("audio"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No audio file provided" });
    return;
  }

  const userId = (req as any).userId;
  req.log.info({ size: req.file.size, mimetype: req.file.mimetype, userId }, "Cloning voice");

  const result = await cloneVoice(req.file.buffer, req.file.originalname || "recording.webm");

  await db
    .insert(usersTable)
    .values({ clerkId: userId, clonedVoiceId: result.voice_id, clonedVoiceName: result.name })
    .onConflictDoUpdate({
      target: usersTable.clerkId,
      set: { clonedVoiceId: result.voice_id, clonedVoiceName: result.name, updatedAt: new Date() },
    });

  res.json({ voice_id: result.voice_id, name: result.name });
});

router.get("/voice/my-clone", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));

  if (!user?.clonedVoiceId) {
    res.json({ has_clone: false });
    return;
  }

  res.json({
    has_clone: true,
    voice_id: user.clonedVoiceId,
    voice_name: user.clonedVoiceName,
  });
});

export async function initializePresetVoices(): Promise<void> {
  const existing = await db.select().from(presetVoicesTable);
  const existingIds = new Set(existing.map((v) => v.id));

  for (const preset of VOICE_PRESETS) {
    if (existingIds.has(preset.id)) {
      logger.info({ presetId: preset.id }, "Preset voice already exists, skipping");
      continue;
    }

    try {
      const voiceId = await designAndSaveVoice(preset, VOICE_PRESETS.indexOf(preset));
      await db.insert(presetVoicesTable).values({
        id: preset.id,
        elevenlabsVoiceId: voiceId,
        name: preset.name,
        description: preset.description,
        emoji: preset.emoji,
      });
      logger.info({ presetId: preset.id, voiceId }, "Preset voice initialized");
    } catch (err) {
      logger.error({ err, presetId: preset.id }, "Failed to initialize preset voice, will retry on next start");
    }
  }
}

export default router;
