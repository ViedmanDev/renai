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
  ListItemText,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Fab,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";
import PeopleIcon from "@mui/icons-material/People";
import GroupMembersDialog from "./GroupMembersDialog";

export default function GroupManager({ open, onClose }) {
  const [groups, setGroups] = useState({ owned: [], member: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [openMembersDialog, setOpenMembersDialog] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (open) {
      loadGroups();
    }
  }, [open]);

  const loadGroups = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Grupos cargados:", data);
        setGroups(data);
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

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError("El nombre del grupo es requerido");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDescription.trim(),
        }),
      });

      if (res.ok) {
        console.log("✅ Grupo creado");
        setNewGroupName("");
        setNewGroupDescription("");
        setOpenCreateDialog(false);
        loadGroups();
      } else {
        const data = await res.json();
        setError(data.message || "Error al crear grupo");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm("¿Estás seguro de eliminar este grupo?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        console.log("✅ Grupo eliminado");
        loadGroups();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Error al eliminar");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    }
  };

  const handleOpenMembers = (group) => {
    setSelectedGroup(group);
    setOpenMembersDialog(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GroupIcon />
            Mis Grupos
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Botón crear grupo */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{
              mb: 3,
              bgcolor: "#2c2c2c",
              "&:hover": { bgcolor: "#1a1a1a" },
            }}
          >
            Crear nuevo grupo
          </Button>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* Grupos propios */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Grupos que administro ({groups.owned?.length || 0})
              </Typography>

              {groups.owned?.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 3, bgcolor: "#f5f5f5", borderRadius: 2, mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No administras ningún grupo aún
                  </Typography>
                </Box>
              ) : (
                <List sx={{ mb: 3 }}>
                  {groups.owned?.map((group) => (
                    <ListItem
                      key={group._id}
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        mb: 1,
                      }}
                      secondaryAction={
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            onClick={() => handleOpenMembers(group)}
                            title="Ver miembros"
                          >
                            <PeopleIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteGroup(group._id)}
                            title="Eliminar grupo"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {group.name}
                            <Chip
                              label={`${group.memberCount} miembro${group.memberCount !== 1 ? 's' : ''}`}
                              size="small"
                              color="primary"
                            />
                          </Box>
                        }
                        secondary={group.description || "Sin descripción"}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {/* Grupos donde es miembro */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Grupos donde soy miembro ({groups.member?.length || 0})
              </Typography>

              {groups.member?.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 3, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No eres miembro de ningún grupo
                  </Typography>
                </Box>
              ) : (
                <List>
                  {groups.member?.map((group) => (
                    <ListItem
                      key={group._id}
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        mb: 1,
                      }}
                      secondaryAction={
                        <IconButton
                          onClick={() => handleOpenMembers(group)}
                          title="Ver miembros"
                        >
                          <PeopleIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {group.name}
                            <Chip
                              label={`${group.memberCount} miembro${group.memberCount !== 1 ? 's' : ''}`}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={group.description || "Sin descripción"}
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

      {/* Dialog: Crear grupo */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear nuevo grupo</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Nombre del grupo"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              disabled={creating}
              required
            />
            <TextField
              fullWidth
              label="Descripción (opcional)"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              disabled={creating}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} disabled={creating}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateGroup}
            variant="contained"
            disabled={creating || !newGroupName.trim()}
            sx={{
              bgcolor: "#2c2c2c",
              "&:hover": { bgcolor: "#1a1a1a" },
            }}
          >
            {creating ? "Creando..." : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Ver miembros */}
      {selectedGroup && (
        <GroupMembersDialog
          open={openMembersDialog}
          onClose={() => {
            setOpenMembersDialog(false);
            setSelectedGroup(null);
          }}
          group={selectedGroup}
          onUpdate={loadGroups}
        />
      )}
    </>
  );
}