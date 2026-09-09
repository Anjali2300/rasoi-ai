import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import StepIndicator from "../components/StepIndicator.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import GenerateRecipeCard from "../components/GenerateRecipeCard.jsx";
import { useRasoi } from "../context/RasoiContext.jsx";

function Results() {
  const { ingredients, recipes } = useRasoi();

  return (
    <div className="results-page">
      <Navbar />

      <main className="results-main">
        <div className="results-container">

          {/* HEADER */}
          <section className="results-heading">
            <div>
              <p className="results-eyebrow">STEP 3 OF 3</p>

              <h1>What can you cook?</h1>

              <p className="results-description">
                We found recipes that match what you already have.
              </p>

              <div className="results-ingredients">
                <span>Your ingredients:</span>

                <div className="results-ingredient-list">
                  {ingredients.map((ingredient, index) => (
                    <span
                      className="results-ingredient-pill"
                      key={`${ingredient}-${index}`}
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to="/confirm"
              className="results-edit-link"
            >
              ← Edit ingredients
            </Link>
          </section>

          {/* RESULTS */}
          {recipes && recipes.length > 0 ? (
            <section className="results-grid">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                />
              ))}

              <GenerateRecipeCard />
            </section>
          ) : (
            <section className="results-empty">
              <div className="results-empty-icon">✦</div>

              <h2>No exact matches</h2>

              <p>
                We couldn't find a recipe that closely matches
                your ingredients, but Rasoi can create one for you.
              </p>

              <GenerateRecipeCard />
            </section>
          )}

          {/* STEPS */}
          <StepIndicator currentStep={3} />

        </div>
      </main>
    </div>
  );
}

export default Results;