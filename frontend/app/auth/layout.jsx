export default function AuthLayout({ children }) {
  // Layout limpio para auth: sin contenedores ni max-width globales
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f7f7f8",
      }}
    >
      {children}
    </div>
  );
}
