import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { appRouter } from "./routers";
import { createContext } from "./_core/trpc";
import { ENV } from "./_core/env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Express parser middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Security and CORS
  app.use(
    helmet({
      contentSecurityPolicy: false, // Let Vite dev server work smoothly
      crossOriginEmbedderPolicy: false,
    })
  );
  
  app.use(
    cors({
      origin: true, // Allow client origin
      credentials: true,
    })
  );

  // tRPC middleware
  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Serve static files from dist/public in production
  const staticPath =
    ENV.nodeEnv === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes (SPA fallback)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = ENV.port;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/ in ${ENV.nodeEnv} mode`);
  });
}

startServer().catch(console.error);
