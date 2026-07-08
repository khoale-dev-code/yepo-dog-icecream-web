require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  const uri = process.env.MONGODB_URI || "";

  if (!uri) {
    console.error("Missing MONGODB_URI in .env");
    process.exit(1);
  }

  const parsed = new URL(uri);

  console.log("Current MongoDB URI info:");
  console.log({
    username: parsed.username,
    passwordLength: decodeURIComponent(parsed.password).length,
    host: parsed.host,
    database: parsed.pathname.replace("/", ""),
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log("MongoDB connected OK:", mongoose.connection.name);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("MongoDB connect failed:", error.message);
  process.exit(1);
});
