// seed.js
// One-time script: reads recipes_ingredients_only.json and inserts every
// recipe into your MongoDB 'recipes' collection, all in one go.

const { MongoClient } = require("mongodb");
const fs = require("fs");
require("dotenv").config();

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI in your .env file.");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB.");

    const db = client.db("Rasoi");
    const collection = db.collection("recipes");

    // Read the JSON file sitting next to this script
    const raw = fs.readFileSync("./recipes_ingredients_only.json", "utf-8");
    const recipes = JSON.parse(raw);
    console.log(`Loaded ${recipes.length} recipes from file.`);

    // Wipe the collection first so re-running this script doesn't create duplicates
    await collection.deleteMany({});

    const result = await collection.insertMany(recipes);
    console.log(`Inserted ${result.insertedCount} recipes into Rasoi.recipes`);
  } catch (err) {
    console.error("Something went wrong:", err);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

seed();
