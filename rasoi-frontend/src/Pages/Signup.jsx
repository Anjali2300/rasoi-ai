import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signup(formData);
      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <Navbar />

      <main className="login-layout">
        {/* LEFT SIDE */}
        <section className="login-intro">
          <div className="login-intro-inner">
            <p className="login-eyebrow">JOIN RASOI</p>

            <h1>
              Start with
              <br />
              what you
              <br />
              <span>have.</span>
            </h1>

            <p className="login-description">
              Create your account and turn the ingredients
              already sitting in your kitchen into delicious
              Indian meals.
            </p>

            <div className="login-mini-note">
              <span>01</span>
              <p>Upload your ingredients</p>
            </div>

            <div className="login-mini-note">
              <span>02</span>
              <p>Find recipes that match</p>
            </div>

            <div className="login-mini-note">
              <span>03</span>
              <p>Cook something delicious</p>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="login-form-section">
          <div className="login-card">
            <div className="login-card-heading">
              <p className="login-card-eyebrow">CREATE ACCOUNT</p>

              <h2>Join Rasoi.</h2>

              <p>
                Create your account to start discovering
                recipes from what you already have.
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="name">Your name</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="email">Email address</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <p className="login-error-message">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="login-submit-button"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account →"}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Already have an account?{" "}
                <Link to="/login">
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Signup;