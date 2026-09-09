import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
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
      await login(formData);

      const destination = location.state?.from?.pathname || "/";
      navigate(destination);
    } catch (err) {
      setError(err.message || "Unable to sign in.");
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
            <p className="login-eyebrow">WELCOME BACK</p>

            <h1>
              Your fridge,
              <br />
              <span>reimagined</span>
              <br />
              as a meal.
            </h1>

            <p className="login-description">
              Sign in to discover authentic Indian recipes
              matched to the ingredients you already have.
            </p>

            <div className="login-mini-note">
              <span>01</span>
              <p>Snap your ingredients</p>
            </div>

            <div className="login-mini-note">
              <span>02</span>
              <p>Verify what you have</p>
            </div>

            <div className="login-mini-note">
              <span>03</span>
              <p>Discover what to cook</p>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="login-form-section">
          <div className="login-card">
            <div className="login-card-heading">
              <p className="login-card-eyebrow">SIGN IN</p>

              <h2>Welcome back.</h2>

              <p>
                Enter your details to continue cooking with Rasoi.
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
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
                  placeholder="Your password"
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
                {loading ? "Signing in..." : "Sign in →"}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Don't have an account?{" "}
                <Link to="/signup">
                  Create one →
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;