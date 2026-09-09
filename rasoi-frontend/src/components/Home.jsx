import { useState } from "react";
import Navbar from "../components/Navbar";

function Home({ onSignIn, onIngredientsDetected }) {

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) {
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

      const formData = new FormData();

      // "photo" must match upload.single("photo")
      // in our Express backend.
      formData.append("photo", selectedFile);

      const response = await fetch(
        "http://localhost:3000/api/detect-ingredients",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to detect ingredients."
        );
      }

      console.log("Detected ingredients:", data.ingredients);

      onIngredientsDetected(data.ingredients);

    } catch (error) {

      console.error("Upload error:", error);

      setError(error.message);

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="home-page">

      <Navbar onSignIn={onSignIn} />

      <main className="hero-section">

        {/* LEFT SIDE */}
        <section className="hero-content">

          <p className="eyebrow">
            AI-POWERED COOKING
          </p>

          <h1>
            Your fridge,
            <br />
            <span>reimagined</span>
            <br />
            as a meal.
          </h1>

          <p className="hero-description">
            Photograph your ingredients and let our AI discover
            authentic Indian recipes matched to what you have —
            no grocery run required.
          </p>

          <div className="steps">

            <div className="step">
              <span>1</span>
              <p>
                Snap your
                <br />
                fridge
              </p>
            </div>

            <div className="step-line"></div>

            <div className="step">
              <span>2</span>
              <p>
                Verify
                <br />
                ingredients
              </p>
            </div>

            <div className="step-line"></div>

            <div className="step">
              <span>3</span>
              <p>
                Discover
                <br />
                recipes
              </p>
            </div>

          </div>

        </section>


        {/* RIGHT SIDE */}
        <section className="upload-section">

          <div className="upload-box">

            <div className="camera-circle">
              📷
            </div>

            <h2>
              Drop your photo here
            </h2>

            <p>
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

            {selectedFile && (
              <p className="selected-file">
                Selected: {selectedFile.name}
              </p>
            )}

            {!selectedFile && (
              <p className="file-info">
                Supports JPG, PNG, HEIC · Max 20 MB
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
                ? "Detecting Ingredients..."
                : "Find Recipes →"}
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Home;