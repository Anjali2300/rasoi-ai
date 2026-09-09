import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import StepIndicator from "../components/StepIndicator.jsx";
import { generateRecipe } from "../api.js";
import { useRasoi } from "../context/RasoiContext.jsx";

function NoMatches() {
  const navigate = useNavigate();

  const {
    ingredients,
    setGeneratedRecipe,
  } = useRasoi();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerateRecipe() {
    if (!ingredients || ingredients.length === 0) {
      setError(
        "We couldn't find your ingredients. Please go back and try again."
      );
      return;
    }

    try {
      setError("");
      setLoading(true);

      const recipe = await generateRecipe({
        ingredients,
      });

      setGeneratedRecipe(recipe);

      navigate("/recipe/generated");
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Rasoi AI couldn't create a recipe right now."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="no-matches-page">
      <Navbar />

      <main className="no-matches-main">
        <div className="no-matches-container">

          {/* TOP */}
          <div className="no-matches-top">
            <p className="no-matches-eyebrow">
              STEP 3 OF 3
            </p>

            <Link
              to="/confirm"
              className="no-matches-edit"
            >
              ← Edit ingredients
            </Link>
          </div>

          {/* MAIN CARD */}
          <section className="no-matches-card">

            <div className="no-matches-icon">
              ✦
            </div>

            <p className="no-matches-label">
              NO DATABASE MATCH
            </p>

            <h1>
              We couldn't find a
              <br />
              recipe for these
              <br />
              ingredients.
            </h1>

            <p className="no-matches-description">
              We searched our recipe collection but couldn't
              find a suitable match. That's okay — Rasoi AI
              can create a recipe using what you already have.
            </p>

            {/* INGREDIENTS */}
            <div className="no-matches-ingredients">
              <span>Your ingredients</span>

              <div className="no-matches-ingredient-list">
                {ingredients.map((ingredient, index) => (
                  <span
                    className="no-matches-ingredient-pill"
                    key={`${ingredient}-${index}`}
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* ACTION */}
            <button
              className="no-matches-ai-button"
              onClick={handleGenerateRecipe}
              disabled={loading}
            >
              <span>
                {loading
                  ? "Creating your recipe..."
                  : "Let Rasoi AI create one"}
              </span>

              {!loading && (
                <span className="no-matches-arrow">
                  →
                </span>
              )}
            </button>

            {error && (
              <p className="no-matches-error">
                {error}
              </p>
            )}

            <p className="no-matches-helper">
              Rasoi AI will choose a sensible dish and
              generate the complete recipe for you.
            </p>

          </section>

          {/* SECONDARY ACTION */}
          <div className="no-matches-bottom">
            <Link to="/confirm">
              ← Add or change ingredients
            </Link>
          </div>

          <StepIndicator currentStep={3} />

        </div>
      </main>
    </div>
  );
}

export default NoMatches;