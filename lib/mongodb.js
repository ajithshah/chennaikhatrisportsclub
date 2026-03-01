import { MongoClient } from "mongodb";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://chennaikhatrisportsclub:chennaikhatrisportsclub@chennaikhatrisportsclub.x08xczo.mongodb.net/?retryWrites=true&w=majority&appName=chennaikhatrisportsclub";
const MONGO_DB = process.env.MONGO_DB || "chennaikhatrisportsclub";

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

if (!MONGO_DB) {
  throw new Error("Please define the MONGO_DB environment variable");
}

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      tls: true,
      tlsAllowInvalidCertificates: true,
    };
    
    cached.promise = MongoClient.connect(MONGO_URI, options)
      .then((client) => {
        console.log("MongoDB connected successfully");
        return {
          client,
          db: client.db(MONGO_DB),
        };
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Helper function to get a collection
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

export default connectToDatabase;
