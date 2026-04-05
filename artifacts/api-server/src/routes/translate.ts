import { Router, type IRouter } from "express";
import { TranslateTextBody, TranslateTextResponse } from "@workspace/api-zod";
import { translateText } from "../services/openai";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.post("/translate", requireAuth, async (req, res): Promise<void> => {
  const parsed = TranslateTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", message: parsed.error.message });
    return;
  }

  const { text, mode } = parsed.data;

  const translated = await translateText(text, mode);
  const response = TranslateTextResponse.parse({ original: text, translated, mode });
  res.json(response);
});

export default router;
