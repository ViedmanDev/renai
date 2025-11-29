"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import GroupIcon from "@mui/icons-material/Group";

export default function ProjectGroupPermissions({ open, onClose, project }) {
  const [projectGroups, setProjectGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedRole, setSelectedRole] = useState("viewer");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (open && project) {
      loadProjectGroups();
      loadAvailableGroups();
    }
  }, [open, project]);

  const loadProjectGroups = async () => {
    setLoading(true);
    setError("");
    
    const projectId = project._id || project.id;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects/${projectId}/group-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Grupos del proyecto:", data);
        setProjectGroups(data.groups || []);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Error al cargar grupos");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

const loadAvailableGroups = async () => {
  try {
    const token = localStorage.getItem("token");
    
        // Cargar TODOS los grupos del usuario (no los del proyecto)
        const res = await fetch(`${API_URL}/groups`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            const data = await res.json();
            console.log("✅ Grupos del usuario:", data);

            // Combinar grupos owned y member
            const allUserGroups = [
                ...(data.owned || []),
                ...(data.member || [])
            ];

            console.log("✅ Total grupos disponibles:", allUserGroups.length);
            setAvailableGroups(allUserGroups);
        } else {
            console.error("❌ Error al cargar grupos:", await res.text());
            setAvailableGroups([]);
        }
    } catch (error) {
        console.error("❌ Error:", error);
        setAvailableGroups([]);
    }
};

  const handleAddGroup = async () => {
    if (!selectedGroupId) {
      setError("Debes seleccionar un grupo");
      return;
    }

    const projectId = project._id || project.id;
    setAdding(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects/${projectId}/group-permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId: selectedGroupId,
          role: selectedRole,
        }),
      });

      if (res.ok) {
        console.log("✅ Grupo agregado al proyecto");
        setSelectedGroupId("");
        setSelectedRole("viewer");
        loadProjectGroups();
      } else {
        const data = await res.json();
        setError(data.message || "Error al agregar grupo");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveGroup = async (groupId) => {
    if (!confirm("¿Estás seguro de remover este grupo del proyecto?")) return;

    const projectId = project._id || project.id;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects/${projectId}/group-permissions/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        console.log("✅ Grupo removido");
        loadProjectGroups();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Error al remover");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    }
  };

  const handleChangeRole = async (groupId, newRole) => {
    const projectId = project._id || project.id;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects/${projectId}/group-permissions/${groupId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        console.log("✅ Rol actualizado");
        loadProjectGroups();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Error al actualizar rol");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    }
  };

  const getRoleBadge = (role) => {
    const colors = { editor: "warning", viewer: "info" };
    const labels = { editor: "Editor", viewer: "Visualizador" };
    return <Chip label={labels[role] || role} color={colors[role] || "default"} size="small" />;
  };

  // Filtrar grupos que ya tienen acceso
    const groupsToShow = availableGroups.filter(
        (g) => !projectGroups.some((pg) => pg.groupId?.toString() === g._id?.toString())
    );

    console.log('🔍 Debug filtro:', {
        totalGruposUsuario: availableGroups.length,
        gruposEnProyecto: projectGroups.length,
        gruposDisponibles: groupsToShow.length
    });
    
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GroupIcon />
          Grupos con Acceso al Proyecto
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Agregar grupo */}
        <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Dar acceso a un grupo
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Seleccionar grupo</InputLabel>
              <Select
                value={selectedGroupId}
                label="Seleccionar grupo"
                onChange={(e) => setSelectedGroupId(e.target.value)}
                disabled={adding || groupsToShow.length === 0}
              >
                {groupsToShow.map((group) => (
                  <MenuItem key={group._id} value={group._id}>
                    {group.name} ({group.memberCount} miembros)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Rol</InputLabel>
              <Select
                value={selectedRole}
                label="Rol"
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={adding}
              >
                <MenuItem value="viewer">👁️ Visualizador</MenuItem>
                <MenuItem value="editor">✏️ Editor</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={adding ? <CircularProgress size={20} /> : <GroupAddIcon />}
              onClick={handleAddGroup}
              disabled={adding || !selectedGroupId}
              sx={{
                bgcolor: "#2c2c2c",
                "&:hover": { bgcolor: "#1a1a1a" },
                minWidth: 120,
              }}
            >
              {adding ? "Agregando..." : "Agregar"}
            </Button>
          </Box>

          {groupsToShow.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              💡 Todos tus grupos ya tienen acceso a este proyecto
            </Typography>
          )}
        </Box>

        {/* Lista de grupos con acceso */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Grupos con acceso ({projectGroups.length})
            </Typography>

            {projectGroups.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay grupos con acceso a este proyecto
                </Typography>
              </Box>
            ) : (
              <List>
                {projectGroups.map((pg) => (
                  <ListItem
                    key={pg.groupId}
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      mb: 1,
                    }}
                    secondaryAction={
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Select
                          size="small"
                          value={pg.role}
                          onChange={(e) => handleChangeRole(pg.groupId, e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="editor">Editor</MenuItem>
                          <MenuItem value="viewer">Visualizador</MenuItem>
                        </Select>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveGroup(pg.groupId)}
                          title="Remover acceso"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {pg.group?.name || "Grupo"}
                          {getRoleBadge(pg.role)}
                          <Chip
                            label={`${pg.group?.memberCount || 0} miembros`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          {pg.group?.description || "Sin descripción"}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Agregado: {new Date(pg.grantedAt).toLocaleDateString('es-ES')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
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