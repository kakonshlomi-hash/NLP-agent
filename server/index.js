require("dotenv").config();
const express = require("express");
const cors = require("cors");

const analyzeRouter = require("./routes/analyze");
const planRouter = require("./routes/plan");
const scriptRouter = require("./routes/script");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/analyze", analyzeRouter);
app.use("/api/plan", planRouter);
app.use("/api/script", scriptRouter);

app.listen(PORT, () => {
  console.log(`NLP Master Assistant server running on port ${PORT}`);
});
