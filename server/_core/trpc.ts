import { initTRPC, TRPCError } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import jwt from "jsonwebtoken";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";
import { getUserByOpenId } from "../db";

export interface UserContext {
  openId: string;
  email: string | null;
  name: string | null;
  role: "user" | "admin";
}

export async function createContext({ req, res }: CreateExpressContextOptions) {
  let user: UserContext | null = null;
  
  // Retrieve token from cookies
  const token = req.cookies?.[COOKIE_NAME] || req.headers.authorization?.replace("Bearer ", "");

  if (token) {
    try {
      const decoded = jwt.verify(token, ENV.jwtSecret) as any;
      if (decoded && decoded.openId) {
        // Retrieve fresh user role & status from db if available
        const dbUser = await getUserByOpenId(decoded.openId);
        user = {
          openId: decoded.openId,
          email: dbUser?.email || decoded.email || null,
          name: dbUser?.name || decoded.name || null,
          role: dbUser?.role || decoded.role || "user",
        };
      }
    } catch (err) {
      console.warn("[tRPC Context] Token verification failed:", err);
    }
  }

  // Fallback: in local dev, if NO session cookie is set, we can auto-log in as the owner
  if (!user && ENV.nodeEnv === "development") {
    user = {
      openId: ENV.ownerOpenId,
      email: "admin@nexusdigest.pk",
      name: ENV.ownerName,
      role: "admin",
    };
  }

  return {
    req,
    res,
    user,
  };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to enforce authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
