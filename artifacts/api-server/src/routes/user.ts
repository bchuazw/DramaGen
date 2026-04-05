import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/user/me", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId;

  let [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));

  if (!user) {
    [user] = await db
      .insert(usersTable)
      .values({ clerkId: userId })
      .onConflictDoNothing()
      .returning();

    if (!user) {
      [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));
    }
  }

  res.json({
    id: user!.id,
    clerk_id: user!.clerkId,
    display_name: user!.displayName,
    has_cloned_voice: !!user!.clonedVoiceId,
    cloned_voice_id: user!.clonedVoiceId,
    cloned_voice_name: user!.clonedVoiceName,
  });
});

export default router;
