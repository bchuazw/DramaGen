import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests", message: "Even DramaGen needs a moment to cool down. Try again in an hour!" },
});

app.use("/api/generate", generateLimiter);
app.use("/api/voice/clone", generateLimiter);

const AUDIO_DIR = path.join(process.cwd(), "public", "audio");
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

app.use("/api", router);

setInterval(() => {
  if (!fs.existsSync(AUDIO_DIR)) return;
  const files = fs.readdirSync(AUDIO_DIR);
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const file of files) {
    const filePath = path.join(AUDIO_DIR, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(filePath);
        logger.info({ file }, "Deleted old audio file");
      }
    } catch {
    }
  }
}, 60 * 60 * 1000);

export default app;
