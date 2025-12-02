"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";

export default function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const validateEmail = (value) => {
    if (!value) return "El email es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Email inválido";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setEmail("");

        // Mostrar URL en consola (solo desarrollo)
        if (data.resetUrl) {
          console.log("🔗 URL de recuperación:", data.resetUrl);
        }
      } else {
        setError(data.message || "Error al enviar el correo");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Recuperar contraseña</Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent>
        {success ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <EmailIcon sx={{ fontSize: 64, color: "#4caf50", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              ¡Correo enviado!
            </Typography>
            {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Revisa tu consola del navegador para obtener el enlace de recuperación.
            </Typography> */}
            <Typography variant="caption" color="text.secondary">
              El enlace expira en 1 hora.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleClose}
                sx={{
                  bgcolor: "#2c2c2c",
                  "&:hover": { bgcolor: "#1a1a1a" },
                }}
              >
                Cerrar
              </Button>
            </Box>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ingresa tu email y te enviaremos un enlace para restablecer tu
              contraseña.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="tu@email.com"
              disabled={loading}
              error={!!error}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !email.trim()}
              sx={{
                bgcolor: "#2c2c2c",
                py: 1.5,
                "&:hover": { bgcolor: "#1a1a1a" },
                "&:disabled": {
                  bgcolor: "#e0e0e0",
                  color: "#9e9e9e",
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Enviando...
                </>
              ) : (
                "Enviar enlace de recuperación"
              )}
            </Button>

            <Button
              onClick={handleClose}
              fullWidth
              sx={{ mt: 2, textTransform: "none" }}
            >
              Cancelar
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
