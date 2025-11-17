"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Verificar token al cargar
  useEffect(() => {
    if (!token) {
      setError("Token no proporcionado");
      setVerifying(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-reset-token?token=${token}`);
      
      if (res.ok) {
        setTokenValid(true);
      } else {
        setError("El enlace es inválido o ha expirado");
      }
    } catch (error) {
      setError("Error al verificar el enlace");
    } finally {
      setVerifying(false);
    }
  };

  const validatePassword = () => {
    if (!password) {
      setError("La contraseña es requerida");
      return false;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setError(data.message || "Error al restablecer contraseña");
      }
    } catch (error) {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!tokenValid) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
          <Paper sx={{ p: 4, width: "100%", textAlign: "center" }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || "Enlace inválido"}
            </Alert>
            <Button
              variant="contained"
              onClick={() => router.push("/auth/login")}
              sx={{ mt: 2 }}
            >
              Volver al login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 4 }}>
        <Paper sx={{ p: 4, width: "100%", borderRadius: 3 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <LockResetIcon sx={{ fontSize: 48, color: "#5e35b1", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Restablecer contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresa tu nueva contraseña
            </Typography>
          </Box>

          {success ? (
            <Alert severity="success">
              ¡Contraseña restablecida! Redirigiendo al login...
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                type="password"
                label="Nueva contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={loading}
                sx={{ mb: 2 }}
                placeholder="Mínimo 6 caracteres"
              />

              <TextField
                fullWidth
                type="password"
                label="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                disabled={loading}
                sx={{ mb: 3 }}
                placeholder="Repite la contraseña"
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !password || !confirmPassword}
                sx={{
                  bgcolor: "#2c2c2c",
                  py: 1.5,
                  "&:hover": { bgcolor: "#1a1a1a" },
                }}
              >
                {loading ? "Restableciendo..." : "Restablecer contraseña"}
              </Button>
            </form>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <ResetPasswordContent />
    </Suspense>
  );
}