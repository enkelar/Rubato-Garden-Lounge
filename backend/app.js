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

const app = express();

// Security and middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({limit: '100kb'}));

// General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/menu')) return next(); // public menu is cached + unthrottled
  return generalLimiter(req, res, next);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/uploads", uploadRoutes)

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Rubato API is running..." });
});

export default app;