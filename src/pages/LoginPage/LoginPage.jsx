import "./LoginPage.css";

function LoginPage() {
  return (
    <>
      <h1 className="title-login">Renay</h1>
      <div className="login-container">
        <h2 className="form-title">Login</h2>
        <form action="" className="login-form">
          Email
          <div className="input-wrapper">
            <input
              type="email"
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
              placeholder="Ingresa tu contraseña"
              className="input-field"
              required
            />
            <i className="material-symbols-rounded">lock</i>
          </div>
          <button className="login-button">Iniciar sesión</button>
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
          <br></br>
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
