import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateRecipe } from "../api.js";
import { useRasoi } from "../context/RasoiContext.jsx";

function GenerateRecipeCard() {
  const navigate = useNavigate();

  const {
    ingredients,
    setGeneratedRecipe,
  } = useRasoi();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    try {
      setError("");
      setLoading(true);

      const recipe = await generateRecipe({
        ingredients,
      });

      setGeneratedRecipe(recipe);

      navigate("/recipe/generated");
    } catch (err) {
      setError(
        err.message || "Could not create a recipe right now."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="generate-card">
      <div className="generate-card-icon">✦</div>

      <p className="generate-card-eyebrow">
        RASOI AI
      </p>

      <h2>Nothing here looks right?</h2>

      <p>
        No problem. Let Rasoi AI decide what you can
        cook from the ingredients you already have.
      </p>

      <button
        className="generate-card-button"
        onClick={handleGenerate}
        disabled={loading}
      >
        <span>
          {loading
            ? "Creating your recipe..."
            : "Let Rasoi AI decide"}
        </span>

        {!loading && <span>→</span>}
      </button>

      {error && (
        <p className="generate-card-error">
          {error}
        </p>
      )}
    </article>
  );
}

export default GenerateRecipeCard;