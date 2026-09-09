const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "Something went wrong."
    );
  }

  return data;
}


// ======================================================
// AUTH
// ======================================================

export async function signup(userData) {
  const response = await fetch(
    `${API_BASE_URL}/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  return handleResponse(response);
}


export async function login(userData) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  return handleResponse(response);
}


// ======================================================
// DETECT INGREDIENTS
// ======================================================

export async function detectIngredients(file) {
  const formData = new FormData();

  formData.append("photo", file);

  const response = await fetch(
    `${API_BASE_URL}/detect-ingredients`,
    {
      method: "POST",
      body: formData,
    }
  );

  return handleResponse(response);
}


// ======================================================
// SEARCH RECIPES
// ======================================================

export async function searchRecipes(ingredients) {
  const response = await fetch(
    `${API_BASE_URL}/search-recipes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ingredients,
      }),
    }
  );

  return handleResponse(response);
}


// ======================================================
// GET RAW DATABASE RECIPE
// ======================================================

export async function getRecipe(id) {
  const response = await fetch(
    `${API_BASE_URL}/recipes/${id}`
  );

  return handleResponse(response);
}


// ======================================================
// GENERATE FULL DETAILS FOR DATABASE RECIPE
// ======================================================

export async function generateRecipeDetails(id) {
  const response = await fetch(
    `${API_BASE_URL}/recipes/${id}/generate-details`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return handleResponse(response);
}


// ======================================================
// AI FALLBACK RECIPE
// ======================================================

export async function generateRecipe({ ingredients }) {
  const response = await fetch(
    `${API_BASE_URL}/generate-recipe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ingredients,
      }),
    }
  );

  return handleResponse(response);
}