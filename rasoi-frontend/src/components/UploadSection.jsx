function UploadSection() {
  return (
    <section className="upload-section">

      <div className="hero-content">
        <p className="eyebrow">AI-POWERED COOKING</p>

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
          <div>
            <span>1</span>
            Snap your fridge
          </div>

          <div className="line"></div>

          <div>
            <span>2</span>
            Verify ingredients
          </div>

          <div className="line"></div>

          <div>
            <span>3</span>
            Discover recipes
          </div>
        </div>
      </div>


      <div className="upload-card">

        <div className="camera-icon">📷</div>

        <h2>Drop your photo here</h2>

        <p>
          Drag & drop a photo of your fridge or pantry,
          or click to browse your files
        </p>

        <label className="choose-button">
          ☁ Choose Photo
          <input type="file" accept="image/*" />
        </label>

        <p className="file-info">
          Supports JPG, PNG, HEIC · Max 20 MB
        </p>

        <div className="divider"></div>

        <p className="demo-title">TRY A DEMO WITH</p>

        <div className="demo-buttons">
          <button>Chicken + Onion</button>
          <button>Dal + Spinach</button>
          <button>Paneer + Tomato</button>
        </div>

        <button className="find-button">
          Find Recipes →
        </button>

      </div>

    </section>
  );
}

export default UploadSection;