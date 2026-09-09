function IngredientTag({ ingredient, onRemove }) {
  return (
    <span className="ingredient-tag">
      {ingredient}

      <button
        type="button"
        onClick={() => onRemove(ingredient)}
        aria-label={`Remove ${ingredient}`}
      >
        ×
      </button>
    </span>
  );
}

export default IngredientTag;