// index.js

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");
const { GoogleGenAI } = require("@google/genai");

require("dotenv").config();

const app = express();
const PORT = 3000;

const upload = multer({
  storage: multer.memoryStorage(),
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(cors());
app.use(express.json());

let recipesCollection;
let usersCollection;


// ======================================================
// START SERVER
// ======================================================

async function startServer() {
  const client = new MongoClient(process.env.MONGODB_URI);

  await client.connect();

  console.log("Connected to MongoDB.");

  const db = client.db("Rasoi");

  recipesCollection = db.collection("recipes");
  usersCollection = db.collection("users");


  // ======================================================
  // AUTHENTICATION
  // ======================================================

  // ------------------------------------------------------
  // SIGN UP
  // ------------------------------------------------------

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          error: "Name, email and password are required.",
        });
      }

      // Basic password validation
      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters long.",
        });
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await usersCollection.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          error: "An account with this email already exists.",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        createdAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);

      // Create JWT token
      const token = jwt.sign(
        {
          userId: result.insertedId.toString(),
          email: normalizedEmail,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.status(201).json({
        message: "Account created successfully.",
        token,
        user: {
          id: result.insertedId,
          name: newUser.name,
          email: newUser.email,
        },
      });

    } catch (err) {
      console.error("SIGNUP ERROR:");
      console.error(err);

      res.status(500).json({
        error: "Something went wrong while creating the account.",
      });
    }
  });


  // ------------------------------------------------------
  // LOGIN
  // ------------------------------------------------------

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: "Email and password are required.",
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Find user
      const user = await usersCollection.findOne({
        email: normalizedEmail,
      });

      if (!user) {
        return res.status(401).json({
          error: "Invalid email or password.",
        });
      }

      // Compare password
      const passwordMatches = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatches) {
        return res.status(401).json({
          error: "Invalid email or password.",
        });
      }

      // Create JWT
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.json({
        message: "Login successful.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });

    } catch (err) {
      console.error("LOGIN ERROR:");
      console.error(err);

      res.status(500).json({
        error: "Something went wrong while logging in.",
      });
    }
  });


  // ======================================================
  // TEST ROUTE
  // ======================================================

  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await recipesCollection
        .find()
        .limit(20)
        .toArray();

      res.json(recipes);

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Something went wrong fetching recipes.",
      });
    }
  });


  // ======================================================
  // SEARCH RECIPES
  // ======================================================

  app.post("/api/search-recipes", async (req, res) => {
    try {
      const userIngredients = req.body.ingredients;

      if (
        !Array.isArray(userIngredients) ||
        userIngredients.length === 0
      ) {
        return res.status(400).json({
          error: "Please provide a non-empty ingredients array.",
        });
      }

      // Normalize user ingredients
      const normalizedInput = userIngredients
        .map((i) => String(i).toLowerCase().trim())
        .filter(Boolean);

      const results = await recipesCollection
        .aggregate([
          {
            $addFields: {
              ingredientsLower: {
                $map: {
                  input: "$ingredients",
                  as: "i",
                  in: {
                    $toLower: "$$i",
                  },
                },
              },
            },
          },

          {
            $addFields: {
              matchedIngredients: {
                $setIntersection: [
                  "$ingredientsLower",
                  normalizedInput,
                ],
              },
            },
          },

          {
            $addFields: {
              matchCount: {
                $size: "$matchedIngredients",
              },

              matchPercent: {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: "$matchedIngredients",
                      },
                      {
                        $size: "$ingredients",
                      },
                    ],
                  },
                  100,
                ],
              },
            },
          },

          {
            $match: {
              matchCount: {
                $gt: 0,
              },
            },
          },

          {
            $sort: {
              matchPercent: -1,
              matchCount: -1,
            },
          },

          {
            $limit: 4,
          },

          {
            $project: {
              name: 1,
              ingredients: 1,
              matchCount: 1,

              matchPercent: {
                $round: [
                  "$matchPercent",
                  0,
                ],
              },
            },
          },
        ])
        .toArray();

      res.json(results);

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Something went wrong searching recipes.",
      });
    }
  });


  // ======================================================
  // GET ONE RECIPE
  // ======================================================

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "That doesn't look like a valid recipe id.",
        });
      }

      const recipe = await recipesCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!recipe) {
        return res.status(404).json({
          error: "No recipe found with that id.",
        });
      }

      res.json(recipe);

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Something went wrong fetching that recipe.",
      });
    }
  });


  // ======================================================
  // GENERATE FULL DETAILS FOR A DATABASE RECIPE
  // ======================================================

  app.post("/api/recipes/:id/generate-details", async (req, res) => {
    try {
      const { id } = req.params;

      // Check recipe id
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "That doesn't look like a valid recipe id.",
        });
      }

      // Get selected recipe from MongoDB
      const recipe = await recipesCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!recipe) {
        return res.status(404).json({
          error: "No recipe found with that id.",
        });
      }

      // Ask Gemini to turn the basic database recipe
      // into a complete recipe.
      const prompt = `
You are the recipe AI for an Indian cooking application called Rasoi.

The user selected this recipe from the Rasoi recipe database.

Recipe name:
${recipe.name}

Database ingredients:
${(recipe.ingredients || []).join(", ")}

Your job is to turn this database recipe into a complete,
practical Indian recipe.

IMPORTANT RULES:

1. Keep the recipe based on the selected database recipe.
2. Do NOT change it into an unrelated dish.
3. Use the database ingredients as the foundation.
4. You may add common cooking ingredients, spices, oil,
   salt, water, or other normal ingredients when necessary.
5. Provide clear and practical cooking steps.
6. Provide a realistic approximate cooking time.
7. Provide realistic servings.
8. Provide approximate calories per serving.
9. Provide approximate protein per serving.
10. Provide approximate carbohydrates per serving.
11. Provide approximate fat per serving.
12. These nutrition values are estimates.
13. Return ONLY valid JSON.
14. Do not use markdown.
15. Do not add explanations outside the JSON.

Use exactly this structure:

{
  "name": "string",
  "description": "string",
  "timeMinutes": number,
  "servings": number,
  "calories": number,
  "nutrition": {
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "ingredients": ["string"],
  "steps": ["string"]
}
`;

      const geminiResponse =
        await ai.models.generateContent({
          model: "gemini-3.6-flash",

          contents: [
            {
              text: prompt,
            },
          ],
        });

      const cleanedText =
        geminiResponse.text
          .trim()
          .replace(/^```json\s*|\s*```$/g, "");

      let fullRecipe;

      try {
        fullRecipe = JSON.parse(cleanedText);

      } catch (parseErr) {
        console.error(
          "Gemini returned invalid recipe JSON:",
          geminiResponse.text
        );

        return res.status(502).json({
          error:
            "Gemini did not return valid recipe data.",
        });
      }

      // Keep the original MongoDB recipe id
      fullRecipe._id = recipe._id;

      res.json(fullRecipe);

    } catch (err) {
      console.error(
        "GENERATE RECIPE DETAILS ERROR:"
      );

      console.error(err);

      res.status(500).json({
        error:
          "Something went wrong generating the full recipe.",
        details: err.message,
      });
    }
  });


  // ======================================================
  // DETECT INGREDIENTS FROM PHOTO
  // ======================================================

  app.post(
    "/api/detect-ingredients",
    upload.single("photo"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            error:
              "No photo received. Send it as form-data with the key 'photo'.",
          });
        }

        const base64Image =
          req.file.buffer.toString("base64");

        const mimeType = req.file.mimetype;

        const geminiResponse =
          await ai.models.generateContent({
            model: "gemini-3.6-flash",

            contents: [
              {
                text: `
Look at this photo of a fridge, pantry, or kitchen counter.

Identify visible MAIN FOOD INGREDIENTS that can be used to make recipes.

Include:
- vegetables
- fruits
- paneer and dairy
- eggs
- chicken, fish, or other meat
- rice, wheat, flour, grains
- lentils, beans, chickpeas
- nuts and other substantial foods

Do NOT include:
- salt
- cooking oil
- water
- spice powders
- whole spices
- sauces or condiments unless clearly a main ingredient

Return common English ingredient names.

Return ONLY a valid JSON array.
No explanation.
No markdown.

Example:
["Paneer", "Tomato", "Onion", "Spinach"]
`,
              },

              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          });

        const cleanedText =
          geminiResponse.text
            .trim()
            .replace(/^```json\s*|\s*```$/g, "");

        let ingredients;

        try {
          ingredients = JSON.parse(cleanedText);

        } catch (parseErr) {
          console.error(
            "Gemini did not return valid JSON:",
            geminiResponse.text
          );

          return res.status(502).json({
            error:
              "Couldn't understand the ingredients Gemini returned.",
          });
        }

        res.json({
          ingredients,
        });

      } catch (err) {
        console.error(
          "DETECT INGREDIENTS ERROR:"
        );

        console.error(err);

        res.status(500).json({
          error:
            "Something went wrong detecting ingredients.",
          details: err.message,
        });
      }
    }
  );


  // ======================================================
  // AI FALLBACK RECIPE
  // ======================================================

  app.post("/api/generate-recipe", async (req, res) => {
    try {
      const { ingredients } = req.body;

      // Ingredients are required.
      // Dish name is NOT required because Gemini
      // will decide what dish to make.
      if (
        !Array.isArray(ingredients) ||
        ingredients.length === 0
      ) {
        return res.status(400).json({
          error:
            "Please provide a non-empty ingredients array.",
        });
      }

      const cleanedIngredients = ingredients
        .map((ingredient) => String(ingredient).trim())
        .filter(Boolean);

      if (cleanedIngredients.length === 0) {
        return res.status(400).json({
          error:
            "Please provide at least one valid ingredient.",
        });
      }

      const prompt = `
You are the recipe AI for an Indian cooking application called Rasoi.

The user has these available ingredients:

${cleanedIngredients.join(", ")}

There was no suitable recipe match in the Rasoi recipe database.

The user has NOT told you what dish they want.

Your job is to decide what practical and delicious dish the user can make
using the ingredients they already have.

IMPORTANT RULES:

1. YOU must decide the dish name.
2. The user should NOT need to provide a dish name.
3. Prefer an Indian dish when it makes sense.
4. Prioritize the ingredients the user already has.
5. You may add a small number of common pantry ingredients or spices when necessary.
6. Do not invent unusual, expensive, or difficult ingredients.
7. Make sure the chosen dish actually makes sense with the available ingredients.
8. Return a complete recipe.
9. Include the dish name in the "name" field.
10. Give realistic approximate nutrition values per serving.

For example:

If the ingredients are:
Strawberry, Milk

You could choose a sensible recipe such as:
Strawberry Lassi

Do NOT ask the user for a dish name.

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations outside the JSON.

Use exactly this structure:

{
  "name": "string",
  "description": "string",
  "timeMinutes": number,
  "servings": number,
  "calories": number,
  "nutrition": {
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "ingredients": ["string"],
  "steps": ["string"]
}
`;

      const geminiResponse =
        await ai.models.generateContent({
          model: "gemini-3.6-flash",

          contents: [
            {
              text: prompt,
            },
          ],
        });

      const cleanedText =
        geminiResponse.text
          .trim()
          .replace(/^```json\s*|\s*```$/g, "");

      let recipe;

      try {
        recipe = JSON.parse(cleanedText);

      } catch (parseErr) {
        console.error(
          "Gemini returned invalid JSON:",
          geminiResponse.text
        );

        return res.status(502).json({
          error:
            "Gemini did not return valid recipe data.",
        });
      }

      res.json(recipe);

    } catch (err) {
      console.error(
        "GENERATE RECIPE ERROR:"
      );

      console.error(err);

      res.status(500).json({
        error:
          "Something went wrong generating the recipe.",
        details: err.message,
      });
    }
  });


  // ======================================================
  // START EXPRESS
  // ======================================================

  app.listen(PORT, () => {
    console.log(
      `Server running at http://localhost:${PORT}`
    );
  });
}

startServer();