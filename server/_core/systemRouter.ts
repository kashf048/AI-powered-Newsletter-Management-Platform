import { router, publicProcedure } from "./trpc";
import { z } from "zod";

export const systemRouter = router({
  ping: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }),
  health: publicProcedure.query(() => {
    return {
      uptime: process.uptime(),
      message: "System is running smoothly",
      date: new Date(),
    };
  }),
});
