import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { detectIngredients } from "../api.js";
import { useRasoi } from "../context/RasoiContext.jsx";

function UploadBox() {
  const navigate = useNavigate();

  const {
    selectedFile,
    setSelectedFile,
    setIngredients,
  } = useRasoi();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Please choose an image smaller than 20 MB.");
      return;
    }

    setSelectedFile(file);
    setError("");
  }

  async function handleFindRecipes() {
    if (!selectedFile) {
      setError("Please choose a photo first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await detectIngredients(selectedFile);

      setIngredients(data.ingredients || []);

      navigate("/confirm");

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to detect ingredients. Please try another photo.");

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upload-box">

      <div className="camera-circle">
        📷
      </div>

      <h2>
        Drop your photo here
      </h2>

      <p className="upload-description">
        Drag & drop a photo of your fridge or pantry,
        <br />
        or click to browse your files
      </p>

      <label className="choose-photo">

        ☁ Choose Photo

        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />

      </label>

      {selectedFile ? (
        <p className="selected-file">
          Selected: {selectedFile.name}
        </p>
      ) : (
        <p className="file-info">
          Supports JPG, PNG, WEBP, HEIC · Max 20 MB
        </p>
      )}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      <div className="upload-divider"></div>

      <button
        className="find-button"
        onClick={handleFindRecipes}
        disabled={loading}
      >
        {loading
          ? "Detecting Ingredients with AI..."
          : "Find Recipes →"}
      </button>

    </div>
  );
}

export default UploadBox;