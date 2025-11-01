import { useState } from "react";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("Login exitoso!");
      } else {
        alert(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al backend");
    }
  };

  return (
    <div className="login-container">
      <h2 className="form-title">Login</h2>
      <form className="login-form" onSubmit={handleLogin}>
        Email
        <div className="input-wrapper">
          <input
            type="email"
            placeholder="Ingresa tu email"
            className="input-field"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <i className="material-symbols-rounded">mail</i>
        </div>
        Contraseña
        <div className="input-wrapper">
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            className="input-field"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <i className="material-symbols-rounded">lock</i>
        </div>
        <button className="login-button" type="submit">
          Iniciar sesión
        </button>
        <a href="#" className="forgot-pass-link">
          Olvidé mi contraseña
        </a>
      </form>

      <p className="separator">
        <span>or</span>
      </p>
      <div className="social-login">
        <button className="social-button">
          <img src="google-icon.png" alt="" className="social-icon" />
          Continue con Google
        </button>
        <br />
        <button className="social-button social-apple">
          <img src="logo-apple.png" alt="" className="social-icon" />
          Continue con Apple
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
