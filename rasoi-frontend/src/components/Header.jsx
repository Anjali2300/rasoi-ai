function Header() {
  return (
    <header className="header">
      <div className="logo">
        Rasoi <span>AI</span>
      </div>

      <nav className="nav">
        <a href="#how-it-works">How it works</a>
        <a href="#recipes">Recipes</a>
        <button className="signin-button">Sign in</button>
      </nav>
    </header>
  );
}

export default Header;