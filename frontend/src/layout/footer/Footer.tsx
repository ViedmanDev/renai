import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <h2 className="footer-title">RENAI</h2>

        <nav className="footer-nav">
          <a href="#">About</a>
          <a href="#">Services</a>
          <a href="#">Contact</a>
          <a href="#">Privacy</a>
        </nav>

        <p className="footer-copy">
          © {new Date().getFullYear()} RENAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

