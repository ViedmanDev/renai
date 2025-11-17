import { ProjectProvider } from "@/contexts/ProjectContext";
import { AuthProvider } from "@/contexts/AuthContext"; 
import Analytics from "@/components/Analytics";
import "./globals.css";

export const metadata = {
  generator: "v0.app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`font-sans antialiased`}>
        <AuthProvider> 
          <ProjectProvider>
            {children}
          </ProjectProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}