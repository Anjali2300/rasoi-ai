# # RASOI PROJECT DOCUMENTATION
#
# ## 1. Project overview
#
# Rasoi is an AI-powered Indian recipe recommendation application.
#
# Core idea:
# Show Rasoi what ingredients you have, and Rasoi helps you decide what to cook.
#
# Technology:
# - Frontend: React + Vite
# - Routing: React Router
# - State: React Context API
# - Backend: Node.js + Express.js
# - Database: MongoDB Atlas
# - Database driver: native MongoDB Node.js driver
# - AI: Google Gemini via @google/genai
# - Authentication: bcryptjs + JSON Web Tokens (JWT)
# - Image upload: Multer
# - Backend port: 3000
# - Frontend development server: Vite, currently localhost:5173
#
# ## 2. Main user journey
#
# 1. Upload photo
# 2. Gemini detects main food ingredients
# 3. User confirms or edits ingredients
# 4. MongoDB searches for matching recipes
# 5. If useful matches exist, show up to four recipes
# 6. User can select a recipe or ask Rasoi AI to decide
# 7. If a selected database recipe is opened, Gemini expands it into a complete recipe
# 8. If there are zero database matches, show a dedicated No Matches page
# 9. The No Matches page lets Gemini choose a sensible dish and generate a complete recipe
# 10. Both paths end in the same full Recipe Detail UI
#
# ## 3. Architecture
#
# UPLOAD:
# Photo -> React -> POST /api/detect-ingredients -> Express/Multer -> Gemini Vision -> JSON ingredients
#
# SEARCH:
# Confirmed ingredients -> React -> POST /api/search-recipes -> MongoDB aggregation -> ranked recipe results
#
# DATABASE RECIPE:
# Recipe card click -> POST /api/recipes/:id/generate-details -> MongoDB gets selected recipe -> Gemini enriches it -> full recipe -> RecipeDetail
#
# ZERO MATCH:
# MongoDB returns [] -> React -> /no-matches -> user clicks AI -> POST /api/generate-recipe -> Gemini chooses dish + generates full recipe -> /recipe/generated -> RecipeDetail
#
# The architectural separation is:
# - MongoDB = retrieval/grounding and known recipe selection
# - Gemini = generation and recipe enrichment
#
# ## 4. Backend API reference
#
# ### POST /api/auth/signup
# Creates a new user.
#
# Request:
# {
#   "name": "Ayush",
#   "email": "user@example.com",
#   "password": "password123"
# }
#
# Steps:
# - validate name/email/password
# - require password length of at least 6
# - normalize email
# - check for duplicate email
# - hash password using bcrypt
# - insert user into users collection
# - create JWT
# - return token and user
#
# Success: 201 Created
# Duplicate email: 409
#
# ### POST /api/auth/login
# Authenticates a user.
#
# Request:
# {
#   "email": "user@example.com",
#   "password": "password123"
# }
#
# Steps:
# - validate input
# - normalize email
# - find user
# - bcrypt.compare()
# - create JWT
# - return token and user
#
# Success: 200 OK
# Invalid credentials: 401
#
# ### GET /api/recipes
# Test/list endpoint.
#
# Returns up to 20 documents from the recipes collection.
#
# ### POST /api/search-recipes
# Searches the MongoDB recipe collection using user ingredients.
#
# Request:
# {
#   "ingredients": ["Paneer", "Tomato", "Onion"]
# }
#
# Current algorithm:
# - lowercase and trim user ingredients
# - lowercase database ingredient strings
# - find the intersection
# - matchCount = number of matching ingredients
# - matchPercent = matched recipe ingredients / total recipe ingredients * 100
# - discard zero-match recipes
# - sort by matchPercent, then matchCount
# - return at most four recipes
#
# Typical result:
# [
#   {
#     "_id": "...",
#     "name": "Recipe name",
#     "ingredients": ["..."],
#     "matchCount": 3,
#     "matchPercent": 75
#   }
# ]
#
# Current limitations:
# - exact string matching can miss singular/plural differences such as Tomato vs Tomatoes
# - current percentage measures coverage of the recipe ingredient list, not coverage of the user's ingredient list
# - weak matches can therefore appear useful even when the dish is not a good semantic match
#
# ### GET /api/recipes/:id
# Gets one raw recipe document from MongoDB.
#
# This is the basic database record, not the final full recipe experience.
#
# ### POST /api/recipes/:id/generate-details
# Turns a selected database recipe into a complete recipe.
#
# Request body: none required.
#
# Flow:
# Recipe ID -> validate ObjectId -> find recipe in MongoDB -> send recipe name and ingredients to Gemini -> Gemini returns full recipe JSON
#
# Gemini is instructed to:
# - keep the selected dish
# - use database ingredients as the foundation
# - add ordinary cooking ingredients/spices when necessary
# - create practical steps
# - estimate time
# - estimate servings
# - estimate calories
# - estimate protein, carbs, and fat
#
# Response:
# {
#   "name": "string",
#   "description": "string",
#   "timeMinutes": 20,
#   "servings": 2,
#   "calories": 250,
#   "nutrition": {
#     "protein": 8,
#     "carbs": 35,
#     "fat": 9
#   },
#   "ingredients": ["string"],
#   "steps": ["string"]
# }
#
# ### POST /api/detect-ingredients
# Analyzes an uploaded image.
#
# Request:
# multipart/form-data
# field: photo
#
# Flow:
# - Multer stores file in memory
# - buffer converted to Base64
# - MIME type is retained
# - Gemini receives prompt + image
# - Gemini returns JSON array
# - backend parses JSON
#
# Example:
# {
#   "ingredients": ["Strawberry", "Milk"]
# }
#
# Prompt behavior:
# Include main foods such as vegetables, fruits, dairy/paneer, eggs, meat, rice, wheat/flour/grains, lentils, beans, chickpeas, nuts and other substantial foods.
#
# Exclude:
# - salt
# - cooking oil
# - water
# - spice powders
# - whole spices
# - minor sauces/condiments unless they are clearly a main ingredient
#
# ### POST /api/generate-recipe
# Fallback generator for cases where the user asks Rasoi AI to decide what to make.
#
# Request:
# {
#   "ingredients": ["Strawberry", "Milk"]
# }
#
# No dish name is required.
#
# Gemini:
# - decides the dish name
# - prefers a sensible Indian-style dish when appropriate
# - prioritizes available ingredients
# - may add a small number of normal pantry ingredients/spices
# - returns a complete recipe
#
# Response shape is the same full recipe shape used above.
#
# ## 5. Frontend routes
#
# /
# Home
#
# /login
# Login
#
# /signup
# Signup
#
# /confirm
# Confirm detected ingredients
#
# /results
# Recipe search results
#
# /no-matches
# Dedicated zero database match page
#
# /recipe/:id
# Full recipe detail
#
# /recipe/generated
# Full AI-generated recipe detail
#
# Protected pages are currently:
# - /confirm
# - /results
# - /no-matches
# - /recipe/:id
#
# ## 6. Frontend state
#
# AuthContext:
# - user
# - login()
# - signup()
# - logout()
#
# Authentication token and user are currently stored in localStorage.
#
# RasoiContext:
# - selectedFile
# - photoPreview
# - ingredients
# - recipes
# - generatedRecipe
#
# Temporary recipe flow data is persisted in sessionStorage:
# - rasoiIngredients
# - rasoiRecipes
# - rasoiGeneratedRecipe
#
# This means refreshing result-related pages can preserve the recipe flow data.
#
# The uploaded File object itself is not persisted through a browser refresh.
#
# ## 7. Recipe object used by the final UI
#
# The final RecipeDetail experience expects:
#
# {
#   "name": "string",
#   "description": "string",
#   "timeMinutes": 20,
#   "servings": 2,
#   "calories": 250,
#   "nutrition": {
#     "protein": 8,
#     "carbs": 35,
#     "fat": 9
#   },
#   "ingredients": ["ingredient 1", "ingredient 2"],
#   "steps": ["step 1", "step 2"]
# }
#
# Database recipes are currently lightweight and may contain mainly:
# - _id
# - name
# - ingredients
#
# Therefore, selected database recipes are sent to Gemini through /api/recipes/:id/generate-details before being displayed as a full recipe.
#
# ## 8. Zero-match behavior
#
# When /api/search-recipes returns:
#
# []
#
# the frontend navigates to /no-matches.
#
# The page communicates:
# - no suitable database recipe was found
# - what ingredients were detected
# - the user can edit ingredients
# - Rasoi AI can create a recipe
#
# Clicking the AI button sends only ingredients to /api/generate-recipe.
#
# Gemini decides the dish.
#
# Example:
# Strawberry + Milk -> Gemini may choose Strawberry Lassi, depending on its generation.
#
# This avoids asking the user to provide a dish name they may not know.
#
# ## 9. Recipe-detail behavior
#
# For a database result:
# - user clicks recipe card
# - frontend calls POST /api/recipes/:id/generate-details
# - backend gets the selected MongoDB recipe
# - Gemini enriches it
# - same RecipeDetail component displays the result
#
# For a zero-match AI recipe:
# - user clicks the AI button
# - frontend calls POST /api/generate-recipe
# - Gemini chooses the dish and creates the recipe
# - generated recipe is stored in frontend state
# - user goes to /recipe/generated
# - same RecipeDetail component displays the result
#
# Result:
# There is one final recipe experience instead of a weak database-only recipe page and a separate AI recipe page.
#
# ## 10. Authentication flow
#
# SIGN UP:
# React form -> POST /api/auth/signup -> validate -> bcrypt.hash() -> MongoDB -> JWT -> frontend
#
# LOGIN:
# React form -> POST /api/auth/login -> MongoDB lookup -> bcrypt.compare() -> JWT -> frontend
#
# Current production-security note:
# The MVP stores JWT in localStorage. A production implementation can use secure HttpOnly cookies to reduce token exposure to client-side JavaScript.
#
# ## 11. RAG / retrieval plus generation explanation
#
# Rasoi is using a retrieval-then-generation architecture.
#
# Retrieval:
# MongoDB searches the application's known recipe dataset and provides candidate recipes.
#
# Generation/enrichment:
# Gemini generates detailed recipe information after retrieval.
#
# For a database selection:
# MongoDB decides WHICH known dish was selected.
# Gemini explains HOW to make it.
#
# For zero matches:
# Gemini decides WHICH dish is sensible and HOW to make it.
#
# Interview explanation:
# "Rasoi uses MongoDB for retrieval and grounding and Gemini for generation. This provides more control over recommendations than asking an LLM to invent a recipe from raw ingredients every time."
#
# ## 12. Error handling
#
# Frontend:
# handleResponse() parses JSON, checks response.ok, and throws the backend error message.
#
# Common backend responses:
# - 400 = validation/bad request
# - 401 = invalid credentials
# - 404 = resource not found
# - 409 = duplicate signup email
# - 502 = malformed/unusable Gemini JSON
# - 500 = unexpected server error
#
# ## 13. Environment variables
#
# The backend expects:
#
# MONGODB_URI=...
# GEMINI_API_KEY=...
# JWT_SECRET=...
#
# These values must stay on the backend and must not be exposed in frontend source code.
#
# ## 14. Current limitations
#
# 1. Matching is exact after basic lowercase normalization.
# 2. Singular/plural/synonym normalization is not yet implemented.
# 3. Match percentage is based on recipe ingredient coverage.
# 4. Raw database recipe records are lightweight.
# 5. Opening a database recipe triggers a Gemini call.
# 6. Generated nutrition is estimated and not a trusted nutrition database.
# 7. JWT is currently stored in localStorage.
# 8. CORS is currently broad.
# 9. No visible rate limiting is currently implemented.
# 10. Generated database recipe details are not yet cached back into MongoDB.
#
# ## 15. Recommended future improvements
#
# Matching:
# - canonical ingredient names
# - synonym dictionary
# - singular/plural handling
# - separate base ingredients from spices
# - minimum useful-match threshold
# - better ranking
# - semantic/vector search at larger scale
#
# Performance:
# - cache generated recipe details
# - persist enriched recipes in MongoDB
# - avoid repeated Gemini calls
# - add indexes
# - consider background jobs at scale
#
# Security:
# - restrict CORS to the frontend origin
# - add rate limiting
# - validate image type and size server-side
# - use secure HttpOnly cookies in production
# - validate generated JSON schema
#
# Nutrition:
# - use a trusted nutrition database/API for authoritative nutrition data if required
#
# ## 16. API cheat sheet
#
# POST /api/auth/signup
# Create account
#
# POST /api/auth/login
# Login
#
# GET /api/recipes
# Test/list recipes
#
# POST /api/search-recipes
# Find matching recipes
#
# GET /api/recipes/:id
# Get raw database recipe
#
# POST /api/recipes/:id/generate-details
# Enrich selected database recipe with Gemini
#
# POST /api/detect-ingredients
# Detect ingredients from image
#
# POST /api/generate-recipe
# Generate a new recipe when AI must decide the dish
#
# ## 17. Elevator pitch
#
# 30 seconds:
#
# "Rasoi is an AI-powered Indian recipe recommendation app. A user uploads a photo of the ingredients they have, Gemini identifies the main ingredients, and the user confirms them. Rasoi then searches MongoDB and ranks matching recipes. When a user selects a recipe, Gemini enriches the database record with cooking instructions, timing, and estimated nutrition. If there is no suitable database match, Gemini becomes the fallback generator and chooses a dish from the available ingredients."
#
# ## 18. Two-minute explanation
#
# "Rasoi is built with React on the frontend and Node.js with Express on the backend. MongoDB Atlas stores the recipe dataset and Gemini provides the AI capabilities.
#
# The flow starts with an uploaded fridge or kitchen photo. Multer receives the image in memory, the backend converts it to Base64, and Gemini's multimodal model identifies the main food ingredients while avoiding things like salt, oil and minor spices.
#
# The user can then review and modify those ingredients. They are sent to /api/search-recipes, where the backend normalizes the strings and uses a MongoDB aggregation pipeline to calculate matching ingredients and a match percentage. The top four results are returned.
#
# If the user selects a database recipe, Rasoi calls /api/recipes/:id/generate-details. MongoDB supplies the selected recipe and Gemini converts that lightweight record into a complete recipe with a description, timing, servings, calories, nutrition and cooking steps.
#
# If no suitable database recipes exist, Rasoi navigates to a dedicated zero-match screen. The user can ask Rasoi AI to create a recipe. The frontend sends only the available ingredients to /api/generate-recipe, and Gemini chooses the dish itself before generating the complete recipe.
#
# This gives Rasoi a retrieval-plus-generation architecture: MongoDB provides controlled retrieval and grounding, while Gemini provides generation and enrichment."
#
# ## 19. Key project talking points
#
# - Image-to-ingredient detection with a multimodal LLM
# - Human confirmation step before database retrieval
# - MongoDB aggregation-based recipe matching
# - Retrieval + generation architecture
# - AI fallback for zero-match situations
# - AI enrichment of database recipes
# - One unified RecipeDetail experience
# - JWT authentication
# - bcrypt password hashing
# - Structured JSON responses
# - Frontend state persistence for the temporary cooking session
#
# ## 20. Current project status
#
# Working/implemented:
# - React frontend
# - Express backend
# - MongoDB Atlas connection
# - recipe search
# - image upload
# - Gemini ingredient detection
# - ingredient confirmation/editing
# - signup/login
# - JWT generation
# - password hashing
# - zero-match flow
# - AI recipe generation
# - database-recipe Gemini enrichment endpoint
# - unified recipe detail concept
# - session persistence for recipe-flow state
#
# Main remaining engineering work:
# - improve match quality
# - add ingredient normalization
# - reduce repeated Gemini calls
# - harden production security
# - final UI/UX polish and testing
