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
  // ✅ Estados principales
  const [collaborators, setCollaborators] = useState([]); // ← FALTABA ESTE
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("viewer");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // ✅ Cargar colaboradores cuando se abre el modal
  useEffect(() => {
    if (open && project) {
      loadCollaborators();
    }
  }, [open, project]);

  const loadCollaborators = async () => {
    setLoading(true);
    setError("");
    
    const projectId = project._id || project.id;
    
    if (!projectId || projectId === 'undefined') {
      setError('Error: ID de proyecto no válido');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      console.log(`📡 Cargando colaboradores de: /projects/${projectId}/collaborators`);
      
      const res = await fetch(`${API_URL}/projects/${projectId}/collaborators`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Respuesta del servidor:', data);
        
        // ✅ El backend devuelve { owner, collaborators, visibility }
        setOwner(data.owner);
        setCollaborators(data.collaborators || []);
        
      } else {
        const errorData = await res.json();
        console.error('❌ Error:', errorData);
        setError(errorData.message || 'Error al cargar colaboradores');
      }
    } catch (error) {
      console.error("❌ Error cargando colaboradores:", error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newEmail.trim()) {
      setError("El email es requerido");
      return;
    }

    const projectId = project._id || project.id;
    
    if (!projectId || projectId === 'undefined') {
      setError('Error: ID de proyecto no válido');
      return;
    }

    setAdding(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      console.log(`📤 Agregando colaborador: ${newEmail} con rol ${newRole}`);
      
      const res = await fetch(`${API_URL}/projects/${projectId}/collaborators`, {
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
        console.log('✅ Colaborador agregado');
        setNewEmail("");
        setNewRole("viewer");
        loadCollaborators(); // Recargar lista
      } else {
        const data = await res.json();
        console.error('❌ Error:', data);
        setError(data.message || "Error al agregar colaborador");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    if (!confirm("¿Estás seguro de remover este colaborador?")) return;

    const projectId = project._id || project.id;

    try {
      const token = localStorage.getItem("token");
      
      console.log(`🗑️ Removiendo colaborador: ${userId}`);
      
      const res = await fetch(`${API_URL}/projects/${projectId}/collaborators/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        console.log('✅ Colaborador removido');
        loadCollaborators();
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Error al remover');
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError('Error de conexión');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    const projectId = project._id || project.id;

    try {
      const token = localStorage.getItem("token");
      
      console.log(`📝 Cambiando rol de ${userId} a ${newRole}`);
      
      const res = await fetch(`${API_URL}/projects/${projectId}/collaborators/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        console.log('✅ Rol actualizado');
        loadCollaborators();
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Error al actualizar rol');
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError('Error de conexión');
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
    return <Chip label={labels[role] || role} color={colors[role] || 'default'} size="small" />;
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
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
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
              Acceso al proyecto ({collaborators.length} colaborador{collaborators.length !== 1 ? 'es' : ''})
            </Typography>

            {/* Mostrar propietario primero */}
            {owner && (
              <List>
                <ListItem
                  sx={{
                    border: '2px solid #ff9800',
                    borderRadius: 2,
                    mb: 2,
                    bgcolor: '#fff3e0',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={owner.picture} alt={owner.name}>
                      {owner.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {owner.name}
                        {getRoleBadge('owner')}
                      </Box>
                    }
                    secondary={owner.email}
                  />
                </ListItem>
              </List>
            )}

            {/* Lista de colaboradores */}
            {collaborators.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay colaboradores invitados aún
                </Typography>
              </Box>
            ) : (
              <List>
                {collaborators.map((collab) => {
                  const collabUserId = collab.userId?._id || collab.userId;
                  
                  return (
                    <ListItem
                      key={collabUserId || collab.email}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        mb: 1,
                      }}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Select
                            size="small"
                            value={collab.role || "viewer"}
                            onChange={(e) => handleChangeRole(collabUserId, e.target.value)}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="editor">Editor</MenuItem>
                            <MenuItem value="viewer">Visualizador</MenuItem>
                          </Select>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveCollaborator(collabUserId)}
                            title="Remover acceso"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={collab.user?.picture} 
                          alt={collab.user?.name || collab.email}
                        >
                          {(collab.user?.name || collab.email)?.charAt(0)?.toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {collab.user?.name || collab.email}
                            {getRoleBadge(collab.role)}
                          </Box>
                        }
                        secondary={
                          <>
                            {collab.user?.email || collab.email}
                            {collab.grantedAt && (
                              <>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                  Agregado: {new Date(collab.grantedAt).toLocaleDateString('es-ES')}
                                </Typography>
                              </>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
          <Typography variant="caption" fontWeight="bold">
            📋 Permisos por rol:
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            • <strong>Propietario:</strong> Control total del proyecto
          </Typography>
          <Typography variant="caption" display="block">
            • <strong>Editor:</strong> Puede ver y editar el proyecto
          </Typography>
          <Typography variant="caption" display="block">
            • <strong>Visualizador:</strong> Solo puede ver el proyecto
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