import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";
import previewRoutes from "./routes/previewRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import pinoHttp from 'pino-http';
import logger from './utils/logger.js';

const app = express();
app.set('trust proxy', 1);

// Security and middleware
app.use(helmet()); // HTTP headers security
app.use(compression()); // compresses responses (gzip), reduce bandwidth, speedup
app.use(pinoHttp({ logger }));
app.use(express.json({limit: '100kb'})); // clients can't send huge JSON payloads

const allowedOrigins = (process.env.FRONTEND_URL || "").split(",").map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : false,
  credentials: true,
}));

// General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // 300 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});

// Apply rate limiter to all routes except /api/menu
app.use((req, res, next) => {
  if (req.path.startsWith('/api/menu') || req.path.startsWith('/sitemap.xml')) return next();
  return generalLimiter(req, res, next);
});

app.use(previewRoutes);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/uploads", uploadRoutes)
app.use("/sitemap.xml", sitemapRoutes); 

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Rubato API is running..." });
});

app.get("/health", async (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  const healthy = dbState === 1;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    db: ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown",
    uptime: process.uptime(),
  });
});

app.use(errorHandler);

export default app;