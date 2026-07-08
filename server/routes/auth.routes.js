import express from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

function createCookieOptions() {
  const isProduction = env.nodeEnv === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/",
  };
}

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  const validUsername = username === env.admin.username;
  const validPassword = password === env.admin.password;

  if (!validUsername || !validPassword) {
    return res.status(401).json({
      message: "Sai tài khoản hoặc mật khẩu admin.",
    });
  }

  const token = jwt.sign(
    {
      username: env.admin.username,
      role: "admin",
    },
    env.admin.jwtSecret,
    {
      expiresIn: "7d",
    }
  );

  res.cookie(env.admin.cookieName, token, createCookieOptions());

  return res.json({
    admin: {
      username: env.admin.username,
    },
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie(env.admin.cookieName, {
    path: "/",
  });

  return res.json({
    ok: true,
  });
});

router.get("/me", requireAdmin, (req, res) => {
  return res.json({
    admin: req.admin,
  });
});

export default router;
