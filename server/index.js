require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const analyzeRouter = require("./routes/analyze");
const planRouter = require("./routes/plan");
const scriptRouter = require("./routes/script");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3001"] }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/analyze", analyzeRouter);
app.use("/api/plan", planRouter);
app.use("/api/script", scriptRouter);

// Serve built client in production
const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`NLP Master Assistant server running on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY is not set — analysis calls will fail.");
  }
});
