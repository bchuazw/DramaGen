import { Router, type IRouter } from "express";
import path from "path";
import fs from "fs";

const router: IRouter = Router();
const AUDIO_DIR = path.join(process.cwd(), "public", "audio");

router.get("/audio/:filename", (req, res): void => {
  const rawFilename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;

  if (!rawFilename || !/^[\w\-_.]+\.mp3$/.test(rawFilename)) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }

  const filePath = path.join(AUDIO_DIR, rawFilename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "Audio file not found" });
    return;
  }

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Disposition", `attachment; filename="${rawFilename}"`);
  res.setHeader("Cache-Control", "public, max-age=86400");

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

export default router;
