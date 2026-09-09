import { useNavigate } from "react-router-dom";
import { useRasoi } from "../context/RasoiContext.jsx";

function RecipeCard({ recipe }) {
  const navigate = useNavigate();
  const { ingredients } = useRasoi();

  const availableIngredients = ingredients.map((ingredient) =>
    ingredient.toLowerCase().trim()
  );

  const recipeIngredients = (recipe.ingredients || []).map((ingredient) =>
    ingredient.toLowerCase().trim()
  );

  const matchedIngredients = recipeIngredients.filter((ingredient) =>
    availableIngredients.includes(ingredient)
  );

  const stillNeeded = (recipe.ingredients || []).filter(
    (ingredient) =>
      !availableIngredients.includes(
        ingredient.toLowerCase().trim()
      )
  );

  const matchPercent = recipe.matchPercent ?? 0;

  function handleClick() {
    navigate(`/recipe/${recipe._id}`);
  }

  return (
    <article
      className="recipe-card"
      onClick={handleClick}
    >
      {/* TOP */}
      <div className="recipe-card-top">
        <div className="recipe-food-icon">🍲</div>

        <div className="recipe-match">
          <strong>{matchPercent}%</strong>
          <span>match</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="recipe-card-content">
        <p className="recipe-card-label">RECIPE MATCH</p>

        <h2>{recipe.name.replace(/\s*\(Recipe\)\s*$/i, "")}</h2>

        <p className="recipe-matched">
          {matchedIngredients.length} ingredient
          {matchedIngredients.length === 1 ? "" : "s"} matched
        </p>

        {stillNeeded.length > 0 && (
          <div className="recipe-needed">
            <span className="recipe-needed-label">
              STILL NEEDED
            </span>

            <div className="recipe-needed-list">
              {stillNeeded.slice(0, 3).map((ingredient, index) => (
                <span
                  className="recipe-needed-pill"
                  key={`${ingredient}-${index}`}
                >
                  {ingredient}
                </span>
              ))}

              {stillNeeded.length > 3 && (
                <span className="recipe-needed-more">
                  +{stillNeeded.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="recipe-card-footer">
        <span>View recipe</span>
        <span className="recipe-card-arrow">→</span>
      </div>
    </article>
  );
}

export default RecipeCard;