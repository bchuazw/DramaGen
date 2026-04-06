import fs from "fs";
import path from "path";
import FormData from "form-data";
import { logger } from "../lib/logger";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const BASE_URL = "https://api.elevenlabs.io/v1";

export const VOICE_SETTINGS: Record<string, { stability: number; similarity_boost: number; style: number }> = {
  rage:                { stability: 0.3, similarity_boost: 0.8, style: 0.8 },
  drill_sergeant:      { stability: 0.3, similarity_boost: 0.8, style: 0.8 },
  passive_aggressive:  { stability: 0.5, similarity_boost: 0.8, style: 0.6 },
  disappointed_parent: { stability: 0.6, similarity_boost: 0.8, style: 0.7 },
  telenovela:          { stability: 0.3, similarity_boost: 0.7, style: 0.9 },
  ice_cold:            { stability: 0.7, similarity_boost: 0.8, style: 0.5 },
  tiktok:              { stability: 0.4, similarity_boost: 0.8, style: 0.7 },
  corporate:           { stability: 0.4, similarity_boost: 0.8, style: 0.7 },
};

export async function cloneVoice(audioBuffer: Buffer, filename: string): Promise<{ voice_id: string; name: string }> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const form = new FormData();
  const name = `DramaGen User Clone ${Date.now()}`;
  form.append("name", name);
  form.append("files", audioBuffer, { filename, contentType: "audio/webm" });
  form.append("remove_background_noise", "true");
  form.append("description", "User voice clone for DramaGen");

  const response = await fetch(`${BASE_URL}/voices/add`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      ...form.getHeaders(),
    },
    body: form.getBuffer(),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error({ error }, "ElevenLabs voice clone error");
    throw new Error(`Voice clone failed: ${response.status} - ${error}`);
  }

  const data = await response.json() as { voice_id: string };
  return { voice_id: data.voice_id, name };
}

export async function generateSpeech(
  text: string,
  voiceId: string,
  mode: string,
  audioDir: string
): Promise<string> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const settings = VOICE_SETTINGS[mode] ?? { stability: 0.5, similarity_boost: 0.8, style: 0.7 };

  const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_flash_v2_5",
      voice_settings: settings,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error({ error, voiceId, mode }, "ElevenLabs TTS error");
    throw new Error(`TTS generation failed: ${response.status} - ${error}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const filename = `drama_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`;
  const filePath = path.join(audioDir, filename);

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  fs.writeFileSync(filePath, Buffer.from(audioBuffer));
  return filename;
}

export interface VoiceDesignPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  voiceDescription: string;
}

export const VOICE_PRESETS: VoiceDesignPreset[] = [
  {
    id: "preset_raging_chef",
    name: "The Raging Chef",
    description: "Gordon Ramsay-style furious kitchen energy",
    emoji: "👨‍🍳",
    voiceDescription: "An angry middle-aged male British chef screaming at the top of his lungs. Gravelly, intense, furious voice with sharp enunciation.",
  },
  {
    id: "preset_disappointed_mom",
    name: "Disappointed Mom",
    description: "Soft-spoken but devastating guilt",
    emoji: "😔",
    voiceDescription: "A middle-aged American woman speaking softly but with devastating emotional weight. Gentle voice that makes you feel terrible.",
  },
  {
    id: "preset_drill_sergeant",
    name: "The Drill Sergeant",
    description: "Barking, intense, military style",
    emoji: "🎖️",
    voiceDescription: "A loud, booming American male military drill sergeant barking orders. Deep, aggressive, commanding voice.",
  },
  {
    id: "preset_telenovela_star",
    name: "Telenovela Star",
    description: "Over-the-top dramatic soap opera energy",
    emoji: "🎭",
    voiceDescription: "A dramatic female Latin telenovela actress mid-monologue. Passionate, emotional, theatrical voice with exaggerated expression.",
  },
  {
    id: "preset_the_ceo",
    name: "The CEO",
    description: "Cold, calculated corporate rage",
    emoji: "💼",
    voiceDescription: "A cold, calculating male executive speaking slowly and deliberately. Icy calm with barely concealed fury. Low, measured tone.",
  },
  {
    id: "preset_anime_villain",
    name: "Anime Villain",
    description: "Dramatic, theatrical, grandiose",
    emoji: "😈",
    voiceDescription: "A dramatic male anime villain delivering a monologue. Deep, theatrical, grandiose voice with evil laughter undertones.",
  },
];

async function getAvailableVoices(): Promise<Array<{ voice_id: string; name: string; category: string }>> {
  if (!ELEVENLABS_API_KEY) return [];
  const res = await fetch(`${BASE_URL}/voices`, {
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
  });
  if (!res.ok) return [];
  const data = await res.json() as { voices: Array<{ voice_id: string; name: string; category: string }> };
  return data.voices ?? [];
}

async function designVoice(preset: VoiceDesignPreset): Promise<string | null> {
  if (!ELEVENLABS_API_KEY) return null;

  logger.info({ presetId: preset.id }, "Attempting voice design");

  try {
    const designRes = await fetch(`${BASE_URL}/text-to-voice/design`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_id: "eleven_multilingual_ttv_v2",
        voice_description: preset.voiceDescription,
        text: "You have disappointed me for the last time. I want you to think very carefully about what you have done. This is absolutely unacceptable behavior and I will not stand for it any longer, do you understand me clearly?",
      }),
    });

    if (!designRes.ok) {
      logger.warn({ presetId: preset.id, status: designRes.status }, "Voice design API unavailable");
      return null;
    }

    const designData = await designRes.json() as { previews?: Array<{ generated_voice_id: string }> };
    const generatedVoiceId = designData.previews?.[0]?.generated_voice_id;
    if (!generatedVoiceId) return null;

    const createRes = await fetch(`${BASE_URL}/text-to-voice/create-voice-from-preview`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice_name: `DramaGen - ${preset.name}`,
        voice_description: preset.voiceDescription,
        generated_voice_id: generatedVoiceId,
      }),
    });

    if (!createRes.ok) {
      logger.warn({ presetId: preset.id, status: createRes.status }, "Voice create failed");
      return null;
    }

    const createData = await createRes.json() as { voice_id: string };
    logger.info({ presetId: preset.id, voiceId: createData.voice_id }, "Voice preset created via design API");
    return createData.voice_id;
  } catch (err) {
    logger.warn({ err, presetId: preset.id }, "Voice design threw error");
    return null;
  }
}

function assignFallbackVoice(
  preset: VoiceDesignPreset,
  presetIndex: number,
  voices: Array<{ voice_id: string; name: string; category: string }>
): string | null {
  const premade = voices.filter(v => v.category === "premade" || v.category === "professional");
  if (premade.length === 0) {
    const all = voices;
    return all[presetIndex % Math.max(all.length, 1)]?.voice_id ?? null;
  }
  return premade[presetIndex % premade.length]?.voice_id ?? null;
}

export async function designAndSaveVoice(preset: VoiceDesignPreset, presetIndex: number): Promise<string> {
  const designed = await designVoice(preset);
  if (designed) return designed;

  logger.info({ presetId: preset.id }, "Falling back to available ElevenLabs voices");
  const voices = await getAvailableVoices();
  const fallback = assignFallbackVoice(preset, presetIndex, voices);

  if (!fallback) {
    throw new Error(`No voice available for preset ${preset.id}`);
  }

  logger.info({ presetId: preset.id, voiceId: fallback }, "Using fallback voice");
  return fallback;
}
