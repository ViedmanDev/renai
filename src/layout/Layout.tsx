import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../layout/header/Header";
import Footer from "../layout/footer/Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow">
        <Header />
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="flex-grow container mx-auto px-6 pt-24 pb-10">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-200 mt-auto">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;


