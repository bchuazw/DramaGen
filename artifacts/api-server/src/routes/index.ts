import { Router, type IRouter } from "express";
import healthRouter from "./health";
import translateRouter from "./translate";
import voicesRouter from "./voices";
import generateRouter from "./generate";
import audioRouter from "./audio";
import galleryRouter from "./gallery";
import userRouter from "./user";

const router: IRouter = Router();

router.use(healthRouter);
router.use(translateRouter);
router.use(voicesRouter);
router.use(generateRouter);
router.use(audioRouter);
router.use(galleryRouter);
router.use(userRouter);

export default router;
