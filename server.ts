import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Finnhub Proxy
  const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
  const FINNHUB_BASE = "https://finnhub.io/api/v1";

  app.get("/api/stock/quote", async (req, res) => {
    try {
      const { symbol } = req.query;
      if (!FINNHUB_KEY) return res.status(503).json({ error: "API Key missing" });
      const response = await fetch(`${FINNHUB_BASE}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  app.get("/api/stock/candle", async (req, res) => {
    try {
      const { symbol, resolution, from, to } = req.query;
      if (!FINNHUB_KEY) return res.status(503).json({ error: "API Key missing" });
      const response = await fetch(`${FINNHUB_BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch candles" });
    }
  });

  app.get("/api/stock/profile", async (req, res) => {
    try {
      const { symbol } = req.query;
      if (!FINNHUB_KEY) return res.status(503).json({ error: "API Key missing" });
      const response = await fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.get("/api/config", (req, res) => {
    res.json({
      hasFinnhub: !!process.env.FINNHUB_API_KEY,
      hasGemini: !!process.env.GEMINI_API_KEY
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
