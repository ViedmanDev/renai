import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import HomePage from "./pages/HomePage/HomePage";
import Layout from "./layout/Layout";

const App = () => {
  return (
    <Routes>
      {/* Página sin layout */}
      <Route path="/" element={<LoginPage />} />

      {/* Páginas que sí tienen header/footer */}
      <Route element={<Layout />}>
        <Route path="/Home" element={<HomePage />} />
      </Route>
    </Routes>
  );
};

export default App;

