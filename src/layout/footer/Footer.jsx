import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <h2>RENAI</h2>
      <nav className="footer-nav">
        <a href="#">About</a>
        <a href="#">Services</a>
        <a href="#">Contact</a>
        <a href="#">Privacy</a>
      </nav>
      <p>© {new Date().getFullYear()} RENAI. All rights reserved.</p>
    </footer>
  );
};

export default Footer;

