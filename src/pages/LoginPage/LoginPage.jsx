import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    if (email === "admin@gmail.com" && password === "2218") {
      navigate("/home");
    } else {
      alert("Correo o contraseña incorrectos");
    }
  };

  return (
    <>
      <div className="login-container">
        <h2 className="form-title">Login</h2>

        <form onSubmit={handleLogin} className="login-form">
          Email
          <div className="input-wrapper">
            <input
              type="email"
              name="email"
              placeholder="Ingresa tu email"
              className="input-field"
              required
            />
            <i className="material-symbols-rounded">mail</i>
          </div>
          Contraseña
          <div className="input-wrapper">
            <input
              type="password"
              name="password"
              placeholder="Ingresa tu contraseña"
              className="input-field"
              required
            />
            <i className="material-symbols-rounded">lock</i>
          </div>
          <button type="submit" className="login-button">
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
    </>
  );
}

export default LoginPage;
