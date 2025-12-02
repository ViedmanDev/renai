import "./Header.css";
import { Link } from "react-router-dom";
import { Search, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-left">
          <button className="menu-icon">
            <Menu size={20} />
          </button>
          <div className="logo">B</div>
        </div>

        <div className="nav-center">
          <div className="search-container">
            <Menu size={18} className="search-icon-left" />
            <input
              type="text"
              placeholder="Hinted search text"
              className="search-input"
            />
            <Search size={18} className="search-icon-right" />
          </div>
        </div>

        <div className="nav-right">
          <select className="project-select">
            <option>Proyecto 1 Ejemplo Ejemplo</option>
          </select>
          <button className="export-btn">Exportar como</button>
          <button className="share-btn">→</button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
