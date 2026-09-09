import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import StepIndicator from "../components/StepIndicator.jsx";
import IngredientTag from "../components/IngredientTag.jsx";
import { useRasoi } from "../context/RasoiContext.jsx";
import { searchRecipes } from "../api.js";

function ConfirmIngredients() {
  const navigate = useNavigate();

  const {
    photoPreview,
    ingredients,
    setIngredients,
    setRecipes,
  } = useRasoi();

  const [newIngredient, setNewIngredient] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function removeIngredient(indexToRemove) {
    setIngredients((currentIngredients) =>
      currentIngredients.filter(
        (_, index) => index !== indexToRemove
      )
    );
  }

  function addIngredient(event) {
    event.preventDefault();

    const cleanedIngredient = newIngredient.trim();

    if (!cleanedIngredient) {
      return;
    }

    const alreadyExists = ingredients.some(
      (ingredient) =>
        ingredient.toLowerCase() ===
        cleanedIngredient.toLowerCase()
    );

    if (alreadyExists) {
      setNewIngredient("");
      return;
    }

    setIngredients((currentIngredients) => [
      ...currentIngredients,
      cleanedIngredient,
    ]);

    setNewIngredient("");
  }

  async function handleFindRecipes() {
    if (ingredients.length === 0) {
      setError("Please keep at least one ingredient.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      // Search MongoDB
      const results = await searchRecipes(ingredients);

      // Save the search results
      setRecipes(results);

      // If MongoDB found nothing, send the user to zero-match page.
      if (!results || results.length === 0) {
        navigate("/no-matches");
        return;
      }

      // Otherwise show the normal recipe results.
      navigate("/results");

    } catch (err) {
      console.error(err);

      setError(
        err.message || "Could not find recipes."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="confirm-page">
      <Navbar />

      <main className="confirm-main">
        <div className="confirm-container">

          {/* HEADER */}
          <section className="confirm-heading">
            <div>
              <p className="confirm-eyebrow">
                STEP 2 OF 3
              </p>

              <h1>
                Confirm your ingredients
              </h1>

              <p className="confirm-description">
                We detected {ingredients.length} ingredient
                {ingredients.length === 1 ? "" : "s"}.
                Remove anything incorrect or add what we missed.
              </p>
            </div>

            <div className="confirm-step-box">
              <span>02</span>
              <p>Review</p>
            </div>
          </section>

          {/* MAIN CONTENT */}
          <section className="confirm-grid">

            {/* PHOTO */}
            <div className="confirm-photo-card">

              <div className="confirm-card-label">
                <span>YOUR PHOTO</span>
              </div>

              <div className="confirm-photo-wrapper">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Uploaded ingredients"
                    className="confirm-photo"
                  />
                ) : (
                  <div className="confirm-photo-empty">
                    No photo available
                  </div>
                )}
              </div>

            </div>

            {/* INGREDIENTS */}
            <div className="confirm-ingredients-card">

              <div className="confirm-card-label">
                <span>DETECTED INGREDIENTS</span>

                <strong>
                  {ingredients.length}
                </strong>
              </div>

              <div className="ingredient-list">
                {ingredients.length > 0 ? (
                  ingredients.map(
                    (ingredient, index) => (
                      <IngredientTag
                        key={`${ingredient}-${index}`}
                        ingredient={ingredient}
                        onRemove={() =>
                          removeIngredient(index)
                        }
                      />
                    )
                  )
                ) : (
                  <p className="no-ingredients">
                    No ingredients detected yet.
                  </p>
                )}
              </div>

              {/* ADD INGREDIENT */}
              <form
                className="add-ingredient-form"
                onSubmit={addIngredient}
              >
                <div className="add-input-wrapper">

                  <input
                    type="text"
                    placeholder="Add an ingredient..."
                    value={newIngredient}
                    onChange={(event) =>
                      setNewIngredient(
                        event.target.value
                      )
                    }
                  />

                  <button type="submit">
                    Add
                  </button>

                </div>
              </form>

              {error && (
                <p className="error-message">
                  {error}
                </p>
              )}

              {/* FIND RECIPES */}
              <button
                className="confirm-find-button"
                onClick={handleFindRecipes}
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Searching recipes..."
                    : "Find matching recipes"}
                </span>

                {!loading && (
                  <span className="confirm-arrow">
                    →
                  </span>
                )}
              </button>

              <p className="confirm-helper">
                We'll compare these ingredients with our
                recipe database.
              </p>

            </div>

          </section>

          <StepIndicator currentStep={2} />

        </div>
      </main>
    </div>
  );
}

export default ConfirmIngredients;