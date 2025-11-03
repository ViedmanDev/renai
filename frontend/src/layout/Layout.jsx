import { Outlet } from "react-router-dom";
import Header from "./header/Header";
import Footer from "./footer/Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen" style={{ margin: 0, padding: 0 }}>
      {/* HEADER */}
      <header style={{ margin: 0, padding: 0, width: '100%' }}>
        <Header />
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="flex-grow bg-gray-50 pt-20 pb-10 px-6">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer style={{ margin: 0, padding: 0, width: '100%' }}>
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;