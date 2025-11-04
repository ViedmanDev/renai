import { ProjectProvider } from "@/contexts/ProjectContext";
import Analytics from "@/components/Analytics"; // Assuming Analytics is a component located in this path

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`font-sans antialiased`}>
        <ProjectProvider>{children}</ProjectProvider>
        <Analytics />
      </body>
    </html>
  );
}

import "./globals.css";

export const metadata = {
  generator: "v0.app",
};
