import dns from "node:dns";
import mongoose from "mongoose";
import dotenv from "dotenv";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Thiếu MONGODB_URI trong file .env");
  process.exit(1);
}

function maskMongoUri(value) {
  return value.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
}

try {
  console.log("Testing MongoDB connection with Node DNS override...");
  console.log("DNS servers:", dns.getServers().join(", "));
  console.log(maskMongoUri(uri));

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
    family: 4,
  });

  console.log("MongoDB connected OK");
  console.log("Database:", mongoose.connection.name);

  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error("MongoDB connect failed:");
  console.error(error.message);
  process.exit(1);
}
