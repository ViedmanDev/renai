<<<<<<< HEAD:src/pages/LoginPage/LoginPage.jsx
import { useState } from "react";
import "./LoginPage.css";
import { Link, useNavigate } from "react-router-dom"; // 👈 importamos useNavigate
=======
"use client";
>>>>>>> origin/julian/prueba:frontend/app/auth/login/page.jsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD:src/pages/LoginPage/LoginPage.jsx
  const navigate = useNavigate(); // 👈 inicializamos el hook

  const handleLogin = async (e) => {
    e.preventDefault();

=======
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
>>>>>>> origin/julian/prueba:frontend/app/auth/login/page.jsx
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
<<<<<<< HEAD:src/pages/LoginPage/LoginPage.jsx
        alert("Login exitoso!");

        // 👇 Redirige al Home
        navigate("/Home");
=======
        document.cookie = "auth=1; path=/"; // útil si luego usas middleware
        // redirige a donde quieras:
        router.push("/"); // o '/admin' o '/project'
>>>>>>> origin/julian/prueba:frontend/app/auth/login/page.jsx
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

      <p>
        ¿No tienes cuenta? <Link to="/register">Crea una aquí</Link>
      </p>

      <p className="separator">
        <span>or</span>
      </p>

      <div className="social-login">
        <button className="social-button">
          <img src="/google-icon.png" alt="" className="social-icon" />
          Continue con Google
        </button>
        <br />
        <button className="social-button social-apple">
          <img src="/logo-apple.png" alt="" className="social-icon" />
          Continue con Apple
        </button>
      </div>
    </div>
  );
}
