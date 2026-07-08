import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[env.admin.cookieName];

    if (!token) {
      return res.status(401).json({
        message: "Bạn cần đăng nhập admin.",
      });
    }

    const payload = jwt.verify(token, env.admin.jwtSecret);

    req.admin = {
      username: payload.username,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    });
  }
}
