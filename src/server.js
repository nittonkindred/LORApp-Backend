import app from "./app.js";

import dotenv from "dotenv";
import prisma from "./db/prisma.js";

dotenv.config();

async function start() {
  try {
    await prisma.$connect();

    console.log("✅ Connected to PostgreSQL");

    app.listen(3000, () => {
      console.log("🚀 Server running on port 3000");
    });
  } catch (err) {
    console.error(err);
  }
}

start();
