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
server.listen(API_PORT, () => {
  console.log(`AI API listening on http://localhost:${API_PORT}`);
});
server.on("error", (error: NodeJS.ErrnoException) => {
  console.error(error.message);
  process.exit(1);
});
