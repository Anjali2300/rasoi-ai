import Navbar from "../components/Navbar.jsx";
import UploadBox from "../components/UploadBox.jsx";
import StepIndicator from "../components/StepIndicator.jsx";

function Home() {
  return (
    <div className="page">
      <Navbar />

      <main className="hero-section">

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

          <StepIndicator currentStep={1} />

        </section>


        <section className="upload-section">
          <UploadBox />
        </section>

      </main>
    </div>
  );
}

export default Home;