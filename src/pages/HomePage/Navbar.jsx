"use client";

import { Search, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "auth=; path=/; max-age=0";
    router.push("/auth/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-icon">
          <Menu size={20} />
        </button>
        <div className="logo">B</div>
      </div>

      <div className="navbar-center">
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

      <div className="navbar-right">
        <select className="project-select">
          <option>Proyecto 1 Ejemplo Ejemplo</option>
          <option>Proyecto 2</option>
          <option>Proyecto 3</option>
        </select>

        <button className="export-btn">Exportar como</button>
        <button className="share-btn">→</button>

        {/* ✅ BOTÓN LOGOUT */}
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
