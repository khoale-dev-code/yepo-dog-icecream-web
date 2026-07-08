import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

if (!process.env.MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI. Hãy kiểm tra file .env ở thư mục gốc project."
  );
}

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  throw new Error(
    "Missing ADMIN_USERNAME or ADMIN_PASSWORD. Hãy kiểm tra file .env."
  );
}

if (!process.env.ADMIN_JWT_SECRET) {
  throw new Error(
    "Missing ADMIN_JWT_SECRET. Hãy kiểm tra file .env."
  );
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI,

  admin: {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    jwtSecret: process.env.ADMIN_JWT_SECRET,
    cookieName: "yepo_admin_token",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    folder: process.env.CLOUDINARY_FOLDER || "yepo-dog-icecream",
  },
};
