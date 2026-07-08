import cookieParser from "cookie-parser";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { requireAdmin } from "./middleware/requireAdmin.js";

import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import dogRoutes from "./routes/dog.routes.js";
import postRoutes from "./routes/post.routes.js";
import productRoutes from "./routes/product.routes.js";
import promotionRoutes from "./routes/promotion.routes.js";
import publicStoreRoutes from "./routes/publicStore.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import toppingRoutes from "./routes/topping.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = Number(env.port || 4000);
const CLIENT_ORIGIN = env.clientOrigin || "http://localhost:5173";
const IS_PRODUCTION = env.nodeEnv === "production";

app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", CLIENT_ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use(cookieParser());
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  }

  next();
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "yepo-dog-icecream-api",
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);

/**
 * Public API cho trang client.
 */
app.use("/api/public-store", publicStoreRoutes);
app.use("/api/shop", shopRoutes);

/**
 * Admin API.
 */
app.use("/api/admin", requireAdmin, adminRoutes);
app.use("/api/categories", requireAdmin, categoryRoutes);
app.use("/api/products", requireAdmin, productRoutes);
app.use("/api/toppings", requireAdmin, toppingRoutes);
app.use("/api/dogs", requireAdmin, dogRoutes);
app.use("/api/posts", requireAdmin, postRoutes);
app.use("/api/promotions", requireAdmin, promotionRoutes);
app.use("/api/upload", requireAdmin, uploadRoutes);

/**
 * Reservation:
 * POST public cho khách đặt bàn.
 * GET/PATCH/DELETE đã được bảo vệ trong reservation.routes.js.
 */
app.use("/api/reservations", reservationRoutes);

if (IS_PRODUCTION) {
  const clientDistPath = path.resolve(__dirname, "../dist");

  app.use(express.static(clientDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    return res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({
    message: `Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error("[api] error", {
    method: req.method,
    url: req.originalUrl,
    message: error.message,
    stack: error.stack,
  });

  const statusCode = Number(error.statusCode || error.status || 500);

  res.status(statusCode).json({
    message:
      statusCode === 500
        ? "Server đang gặp lỗi. Vui lòng thử lại."
        : error.message,
  });
});

async function bootstrap() {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`[api] running on http://localhost:${PORT}`);
      console.log(`[api] client origin: ${CLIENT_ORIGIN}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`[api] port ${PORT} đang được sử dụng. Hãy chạy npm run kill:api rồi chạy lại.`);
        process.exit(1);
      }

      throw error;
    });
  } catch (error) {
    console.error("[api] failed to start", error);
    process.exit(1);
  }
}

bootstrap();

