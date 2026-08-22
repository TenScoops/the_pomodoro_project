import "./loadEnv";
import cors from "cors";
import express from "express";
import http from "node:http";
import { analyzeRoute } from "./analyzeHandler";

const API_PORT = Number(process.env.API_PORT ?? 4000);

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);
app.use(express.json({ limit: "32kb" }));
app.post("/api/ai/analyze", analyzeRoute);

const server = http.createServer(app);
// 0.0.0.0 so Docker port mapping can reach the process (localhost-only would stay inside the container)
server.listen(API_PORT, "0.0.0.0", () => {
  console.log(`AI API listening on http://localhost:${API_PORT}`);
});
server.on("error", (error: NodeJS.ErrnoException) => {
  console.error(error.message);
  process.exit(1);
});
