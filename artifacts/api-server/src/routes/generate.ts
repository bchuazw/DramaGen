import { Router, type IRouter } from "express";
import path from "path";
import { db } from "@workspace/db";
import { generationsTable } from "@workspace/db";
import { GenerateAudioBody, GenerateAudioResponse } from "@workspace/api-zod";
import { generateSpeech } from "../services/elevenlabs";

const router: IRouter = Router();
const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

router.post("/generate", async (req, res): Promise<void> => {
  const parsed = GenerateAudioBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", message: parsed.error.message });
    return;
  }

  const { text, voice_id, mode, original_text, voice_type, voice_name } = parsed.data;

  const filename = await generateSpeech(text, voice_id, mode, AUDIO_DIR);

  const [generation] = await db
    .insert(generationsTable)
    .values({
      originalText: original_text ?? text,
      translatedText: text,
      mode,
      voiceType: voice_type ?? "preset",
      voiceName: voice_name ?? null,
      audioFilename: filename,
      isPublic: false,
    })
    .returning();

  const response = GenerateAudioResponse.parse({
    audio_url: `/api/audio/${filename}`,
    generation_id: generation!.id,
  });

  res.json(response);
});

export default router;
