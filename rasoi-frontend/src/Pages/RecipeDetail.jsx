import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { generateRecipeDetails } from "../api.js";
import { useRasoi } from "../context/RasoiContext.jsx";

function RecipeDetail() {
  const { id } = useParams();
  const { generatedRecipe } = useRasoi();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecipe() {
      try {
        setLoading(true);
        setError("");

        // AI GENERATED RECIPE
        if (id === "generated") {
          if (!generatedRecipe) {
            setError("Generated recipe is no longer available.");
          } else {
            setRecipe(generatedRecipe);
          }
          setLoading(false);
          return;
        }

        // DATABASE RECIPE
        const fullRecipe = await generateRecipeDetails(id);
        setRecipe(fullRecipe);

      } catch (err) {
        console.error("RECIPE DETAIL ERROR:", err);
        setError(err.message || "Could not load this recipe.");
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [id, generatedRecipe]);

  // LOADING
  if (loading) {
    return (
      <div className="recipe-page">
        <Navbar />
        <main className="recipe-main">
          <div className="recipe-loading">
            <div className="recipe-loading-icon">✦</div>
            <h2>Preparing your recipe...</h2>
            <p>
              Rasoi AI is generating the cooking instructions and nutrition.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ERROR
  if (error || !recipe) {
    return (
      <div className="recipe-page">
        <Navbar />
        <main className="recipe-main">
          <div className="recipe-error-card">
            <p className="recipe-eyebrow">RASOI</p>
            <h1>Recipe unavailable</h1>
            <p>{error || "We couldn't load this recipe."}</p>
            <Link to="/results" className="recipe-back-button">
              ← Back to recipes
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const recipeName = recipe.name?.replace(/\s*\(Recipe\)\s*$/i, "");
  const nutrition = recipe.nutrition || {};

  return (
    <div className="recipe-page">
      <Navbar />

      <main className="recipe-main">
        <div className="recipe-container">

          <Link to="/results" className="recipe-back-link">
            ← Back to recipes
          </Link>

          {/* HERO */}
          <section className="recipe-hero">
            <div className="recipe-hero-copy">
              <p className="recipe-eyebrow">
                {id === "generated" ? "CREATED BY RASOI AI" : "RECIPE"}
              </p>

              <h1>{recipeName}</h1>

              {recipe.description && (
                <p className="recipe-description">
                  {recipe.description}
                </p>
              )}

              <div className="recipe-meta">
                <div className="recipe-meta-item">
                  <span className="recipe-meta-icon">◷</span>
                  <div>
                    <small>TIME</small>
                    <strong>{recipe.timeMinutes ?? "—"} min</strong>
                  </div>
                </div>

                <div className="recipe-meta-item">
                  <span className="recipe-meta-icon">◉</span>
                  <div>
                    <small>SERVINGS</small>
                    <strong>{recipe.servings ?? "—"}</strong>
                  </div>
                </div>

                <div className="recipe-meta-item">
                  <span className="recipe-meta-icon">🔥</span>
                  <div>
                    <small>CALORIES</small>
                    <strong>
                      {recipe.calories != null ? `${recipe.calories} kcal` : "—"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="recipe-hero-art">
              <div className="recipe-art-circle">🍲</div>
              <span className="recipe-art-small small-one">✦</span>
              <span className="recipe-art-small small-two">✦</span>
            </div>
          </section>

          {/* CONTENT GRID */}
          <section className="recipe-content-grid">

            {/* INGREDIENTS */}
            <div className="recipe-section-card">
              <div className="recipe-section-heading">
                <p>01</p>
                <h2>Ingredients</h2>
              </div>

              <ul className="recipe-ingredients-list">
                {(recipe.ingredients || []).map((ingredient, index) => (
                  <li key={`${ingredient}-${index}`}>
                    <span className="ingredient-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* NUTRITION */}
            <div className="recipe-section-card nutrition-card">
              <div className="recipe-section-heading">
                <p>02</p>
                <h2>Nutrition (est.)</h2>
              </div>

              <div className="nutrition-grid">
                <div className="nutrition-item">
                  <span className="nutrition-label">CALORIES</span>
                  <strong className="nutrition-value">
                    {recipe.calories != null ? recipe.calories : "—"}
                  </strong>
                </div>

                <div className="nutrition-item">
                  <span className="nutrition-label">PROTEIN</span>
                  <strong className="nutrition-value">
                    {nutrition.protein != null ? `${nutrition.protein}g` : "—"}
                  </strong>
                </div>

                <div className="nutrition-item">
                  <span className="nutrition-label">CARBS</span>
                  <strong className="nutrition-value">
                    {nutrition.carbs != null ? `${nutrition.carbs}g` : "—"}
                  </strong>
                </div>

                <div className="nutrition-item">
                  <span className="nutrition-label">FAT</span>
                  <strong className="nutrition-value">
                    {nutrition.fat != null ? `${nutrition.fat}g` : "—"}
                  </strong>
                </div>
              </div>

              <p className="nutrition-note">
                Nutritional values are approximate estimates generated by AI.
              </p>
            </div>

            {/* STEPS */}
            <div className="recipe-section-card recipe-steps-card">
              <div className="recipe-section-heading">
                <p>03</p>
                <h2>Instructions</h2>
              </div>

              <ol className="recipe-steps-list">
                {(recipe.steps || []).map((step, index) => (
                  <li key={index} className="recipe-step-item">
                    <span className="recipe-step-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="recipe-step-text">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}

export default RecipeDetail;