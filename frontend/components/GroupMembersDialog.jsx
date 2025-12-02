"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function GroupMembersDialog({ open, onClose, group, onUpdate }) {
  const [members, setMembers] = useState({ owner: null, members: [] });
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (open && group) {
      loadMembers();
    }
  }, [open, group]);

  const loadMembers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/groups/${group._id}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Miembros cargados:", data);
        setMembers(data);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Error al cargar miembros");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      setError("El email es requerido");
      return;
    }

    setAdding(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/groups/${group._id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newMemberEmail.toLowerCase().trim() }),
      });

      if (res.ok) {
        console.log("✅ Miembro agregado");
        setNewMemberEmail("");
        loadMembers();
        onUpdate?.();
      } else {
        const data = await res.json();
        setError(data.message || "Error al agregar miembro");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("¿Estás seguro de remover este miembro?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/groups/${group._id}/members/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        console.log("✅ Miembro removido");
        loadMembers();
        onUpdate?.();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Error al remover");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    }
  };

    // Obtener el email del usuario actual desde localStorage o del contexto
    const currentUserEmail = localStorage.getItem("userEmail") ||
        members.owner?.email; // fallback

    const isOwner = members.owner?.email === currentUserEmail;

    console.log('🔍 Debug isOwner:', {
        ownerEmail: members.owner?.email,
        currentEmail: currentUserEmail,
        isOwner: isOwner
    });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Miembros de "{group?.name}"
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Agregar miembro (solo si es owner) */}
        {isOwner && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Agregar nuevo miembro
            </Typography>
            
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Email del usuario"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                disabled={adding}
              />
              
              <Button
                variant="contained"
                startIcon={adding ? <CircularProgress size={20} /> : <PersonAddIcon />}
                onClick={handleAddMember}
                disabled={adding || !newMemberEmail.trim()}
                sx={{
                  bgcolor: "#2c2c2c",
                  "&:hover": { bgcolor: "#1a1a1a" },
                  minWidth: 120,
                }}
              >
                {adding ? "Agregando..." : "Agregar"}
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              💡 El usuario debe tener una cuenta en el sistema.
            </Typography>
          </Box>
        )}

        {/* Lista de miembros */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Miembros ({(members.members?.length || 0) + 1})
            </Typography>

            <List>
              {/* Owner */}
              {members.owner && (
                <ListItem
                  sx={{
                    border: "2px solid #ff9800",
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: "#fff3e0",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={members.owner.picture} alt={members.owner.name}>
                      {members.owner.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {members.owner.name}
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{
                            bgcolor: "#ff9800",
                            color: "white",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: "bold",
                          }}
                        >
                          Administrador
                        </Typography>
                      </Box>
                    }
                    secondary={members.owner.email}
                  />
                </ListItem>
              )}

              {/* Miembros */}
              {members.members?.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay miembros en este grupo aún
                  </Typography>
                </Box>
              ) : (
                members.members?.map((member) => (
                  <ListItem
                    key={member.userId}
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      mb: 1,
                    }}
                    secondaryAction={
                      isOwner && (
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveMember(member.userId)}
                          title="Remover del grupo"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={member.user?.picture}
                        alt={member.user?.name || member.user?.email}
                      >
                        {(member.user?.name || member.user?.email)?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.user?.name || member.user?.email}
                      secondary={
                        <>
                          {member.user?.email}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Agregado: {new Date(member.addedAt).toLocaleDateString('es-ES')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}