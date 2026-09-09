import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import ConfirmIngredients from "./Pages/ConfirmIngredients.jsx";
import Results from "./Pages/Results.jsx";
import NoMatches from "./Pages/NoMatches.jsx";
import RecipeDetail from "./Pages/RecipeDetail.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/confirm"
          element={<ConfirmIngredients />}
        />

        <Route
          path="/results"
          element={<Results />}
        />

        <Route
          path="/no-matches"
          element={<NoMatches />}
        />

        <Route
          path="/recipe/:id"
          element={<RecipeDetail />}
        />
      </Route>
    </Routes>
  );
}

export default App;