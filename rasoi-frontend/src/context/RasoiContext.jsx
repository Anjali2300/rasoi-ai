import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const RasoiContext = createContext(null);

function getStoredIngredients() {
  try {
    const stored = sessionStorage.getItem("rasoiIngredients");

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getStoredRecipes() {
  try {
    const stored = sessionStorage.getItem("rasoiRecipes");

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getStoredGeneratedRecipe() {
  try {
    const stored = sessionStorage.getItem("rasoiGeneratedRecipe");

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function RasoiProvider({ children }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const [ingredients, setIngredientsState] = useState(
    getStoredIngredients
  );

  const [recipes, setRecipesState] = useState(
    getStoredRecipes
  );

  const [generatedRecipe, setGeneratedRecipeState] = useState(
    getStoredGeneratedRecipe
  );

  function setIngredients(value) {
    setIngredientsState((previous) => {
      const next =
        typeof value === "function"
          ? value(previous)
          : value;

      sessionStorage.setItem(
        "rasoiIngredients",
        JSON.stringify(next)
      );

      return next;
    });
  }

  function setRecipes(value) {
    setRecipesState((previous) => {
      const next =
        typeof value === "function"
          ? value(previous)
          : value;

      sessionStorage.setItem(
        "rasoiRecipes",
        JSON.stringify(next)
      );

      return next;
    });
  }

  function setGeneratedRecipe(value) {
    setGeneratedRecipeState(value);

    if (value) {
      sessionStorage.setItem(
        "rasoiGeneratedRecipe",
        JSON.stringify(value)
      );
    } else {
      sessionStorage.removeItem("rasoiGeneratedRecipe");
    }
  }

  const photoPreview = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  function clearRasoiData() {
    setSelectedFile(null);
    setIngredientsState([]);
    setRecipesState([]);
    setGeneratedRecipeState(null);

    sessionStorage.removeItem("rasoiIngredients");
    sessionStorage.removeItem("rasoiRecipes");
    sessionStorage.removeItem("rasoiGeneratedRecipe");
  }

  return (
    <RasoiContext.Provider
      value={{
        selectedFile,
        setSelectedFile,

        photoPreview,

        ingredients,
        setIngredients,

        recipes,
        setRecipes,

        generatedRecipe,
        setGeneratedRecipe,

        clearRasoiData,
      }}
    >
      {children}
    </RasoiContext.Provider>
  );
}

export function useRasoi() {
  const context = useContext(RasoiContext);

  if (!context) {
    throw new Error(
      "useRasoi must be used inside RasoiProvider"
    );
  }

  return context;
}