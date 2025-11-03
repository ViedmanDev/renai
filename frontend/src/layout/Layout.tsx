import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../layout/header/Header";
import Footer from "../layout/footer/Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen" style={{ margin: 0, padding: 0, width: '100%' }}>
      {/* HEADER */}
      <header style={{ margin: 0, padding: 0, width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
        <Header />
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="flex-grow bg-gray-50 pt-20 pb-10 px-6">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer style={{ margin: 0, padding: 0, width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;