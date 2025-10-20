import "./Header.css";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <h1>RENAI</h1>
      <nav className="nav">
        <Link to="/Home">Inicio</Link>
        <Link to="/Perfil">Perfil</Link>
        <Link to="/Configuración">Configuración</Link>
      </nav>
    </header>
  );
};

export default Header;
