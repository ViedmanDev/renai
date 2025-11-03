import React from "react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">B</div>
        <button className="menu-btn">Hinted search text</button>
      </div>

      <div className="navbar-center">
        <input type="text" placeholder="Buscar..." className="search-input" />
      </div>

      <div className="navbar-right">
        <button className="user-btn">User name example</button>
        <button className="logout-btn">⎋</button>
      </div>
    </nav>
  );
}
