import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

export async function connectToDatabase() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("Shopping-cart");
  return{
    db
  }
}
