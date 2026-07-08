import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  dns.setDefaultResultOrder("ipv4first");
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongodbUri, {
    autoIndex: env.nodeEnv !== "production",
    serverSelectionTimeoutMS: 15000,
  }, {
    serverSelectionTimeoutMS: 20000,
    family: 4,
  });

  console.log(`[db] MongoDB connected: ${mongoose.connection.name}`);
}
