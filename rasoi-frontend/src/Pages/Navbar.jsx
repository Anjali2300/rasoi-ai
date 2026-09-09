import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleAuthClick() {
    if (user) {
      logout();
      navigate("/");
    } else {
      navigate("/login");
    }
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Rasoi <span>AI</span>
      </Link>

      <button className="signin-button" onClick={handleAuthClick}>
        {user ? "Sign out" : "Sign in"}
      </button>
    </header>
  );
}

export default Navbar;