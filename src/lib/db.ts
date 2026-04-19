import mongoose from "mongoose";

const globalForMongoose = globalThis as typeof globalThis & {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

const cached = globalForMongoose.mongoose ?? { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  cached.promise ??= mongoose.connect(mongoUri, { bufferCommands: false });
  cached.conn = await cached.promise;
  globalForMongoose.mongoose = cached;
  return cached.conn;
}
