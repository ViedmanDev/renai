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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Chip,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function ProjectCollaborators({ open, onClose, project }) {
  const [collaborators, setCollaborators] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("viewer");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (open && project) {
      loadCollaborators();
    }
  }, [open, project]);

  const loadCollaborators = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects/${project.id}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setOwner(data.owner);
        setCollaborators(data.collaborators || []);
      }
    } catch (error) {
      console.error("Error cargando colaboradores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newEmail.trim()) {
      setError("El email es requerido");
      return;
    }

    setAdding(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects/${project.id}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          email: newEmail.toLowerCase().trim(), 
          role: newRole 
        }),
      });

      if (res.ok) {
        setNewEmail("");
        setNewRole("viewer");
        loadCollaborators();
      } else {
        const data = await res.json();
        setError(data.message || "Error al agregar colaborador");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error de conexión");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    if (!confirm("¿Estás seguro de remover este colaborador?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects/${project.id}/permissions/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        loadCollaborators();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      owner: 'error',
      editor: 'warning',
      viewer: 'info',
    };
    const labels = {
      owner: 'Propietario',
      editor: 'Editor',
      viewer: 'Visualizador',
    };
    return <Chip label={labels[role]} color={colors[role]} size="small" />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          👥 Gestionar Colaboradores
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Agregar nuevo colaborador */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Invitar nuevo colaborador
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Email del usuario"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              disabled={adding}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Rol</InputLabel>
              <Select
                value={newRole}
                label="Rol"
                onChange={(e) => setNewRole(e.target.value)}
                disabled={adding}
              >
                <MenuItem value="viewer">👁️ Visualizador</MenuItem>
                <MenuItem value="editor">✏️ Editor</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={adding ? <CircularProgress size={20} /> : <PersonAddIcon />}
              onClick={handleAddCollaborator}
              disabled={adding || !newEmail.trim()}
              sx={{
                bgcolor: '#2c2c2c',
                '&:hover': { bgcolor: '#1a1a1a' }
              }}
            >
              {adding ? "Agregando..." : "Invitar"}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            💡 El usuario debe tener una cuenta en el sistema para poder ser agregado.
          </Typography>
        </Box>

        {/* Lista de colaboradores */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Acceso al proyecto
            </Typography>

            <List>
              {owner && (
                <ListItem
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={owner.picture} alt={owner.name}>
                      {owner.name?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={owner.name}
                    secondary={owner.email}
                  />
                  {getRoleBadge('owner')}
                </ListItem>
              )}

              {collaborators.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay colaboradores invitados aún
                  </Typography>
                </Box>
              ) : (
                collaborators.map((collab) => (
                  <ListItem
                    key={collab.userId}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 1,
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveCollaborator(collab.userId)}
                        title="Remover acceso"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={collab.user?.picture} alt={collab.user?.name}>
                        {collab.user?.name?.charAt(0) || collab.email.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={collab.user?.name || collab.email}
                      secondary={
                        <>
                          {collab.user?.email || collab.email}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Agregado: {new Date(collab.grantedAt).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                    {getRoleBadge(collab.role)}
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
          <Typography variant="caption" fontWeight="bold">
            📋 Permisos por rol:
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            • <strong>Propietario:</strong> Control total
          </Typography>
          <Typography variant="caption" display="block">
            • <strong>Editor:</strong> Ver y editar
          </Typography>
          <Typography variant="caption" display="block">
            • <strong>Visualizador:</strong> Solo ver
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}