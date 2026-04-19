import "dotenv/config";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { seedDemoData } from "@/lib/demo-seed";

async function seed() {
  await connectToDatabase();
  const result = await seedDemoData();
  console.log("Campus Nexus seed complete");
  console.log(JSON.stringify(result, null, 2));
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  void mongoose.disconnect();
  process.exit(1);
});
