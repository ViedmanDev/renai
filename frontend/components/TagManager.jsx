"use client";

/**
 * COMPONENTE: TagManager
 * PROPÓSITO: Gestión CRUD de etiquetas/banderas del sistema
 *
 * FUNCIONALIDADES:
 * - Crear nuevas etiquetas con nombre y color
 * - Editar etiquetas existentes
 * - Eliminar etiquetas
 * - Visualizar todas las etiquetas
 *
 * CONEXIÓN A BD:
 * Colección: banderas
 * Campos: _id, name, color, created_at, updated_at
 *
 * API Endpoints (usando config/api.js):
 * - GET /api/tags - Listar todas las etiquetas
 * - POST /api/tags - Crear nueva etiqueta
 * - PUT /api/tags/:id - Actualizar etiqueta
 * - DELETE /api/tags/:id - Eliminar etiqueta
 */

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
// Para Next.js, las rutas API son relativas
const API_BASE = "/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const API_ENDPOINTS = {
  tags: {
    list: "/tags",
    create: "/tags",
    update: (id) => `/tags/${id}`,
    delete: (id) => `/tags/${id}`,
  },
};
import "./TagManager.css";

// Colores predefinidos para etiquetas
const TAG_COLORS = [
  { name: "Rojo", value: "#ef5350" },
  { name: "Rosa", value: "#ec407a" },
  { name: "Púrpura", value: "#ab47bc" },
  { name: "azul", value: "#42a5f5" },
  { name: "Verde", value: "#66bb6a" },
  { name: "Amarillo", value: "#ffee58" },
  { name: "Naranja", value: "#ffa726" },
];

export default function TagManager() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTag, setEditingTag] = useState("");
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(TAG_COLORS[0].value);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /**
   * Carga las etiquetas desde la API al montar el componente
   */
  useEffect(() => {
    fetchTags();
  }, []);

  /**
   * Obtiene todas las etiquetas desde la API
   */
  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}${API_ENDPOINTS.tags.list}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(
          "❌ Error al cargar las banderas:",
          response.status,
          text
        );
        throw new Error("Error al cargar las banderas");
      }

      const result = await response.json();

      // Adaptamos la respuesta según el formato que devuelva tu backend
      const tagsData = Array.isArray(result) ? result : result.data || [];

      // Normalizamos los IDs (_id -> id)
      const normalizedTags = tagsData.map((tag) => ({
        id: tag._id || tag.id,
        name: tag.name,
        color: tag.color,
        created_at: tag.created_at,
        updated_at: tag.updated_at,
      }));

      setTags(normalizedTags);
    } catch (error) {
      console.error("Error al cargar banderas:", error);
      showSnackbar("Error de conexión al cargar banderas", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Muestra un mensaje temporal
   */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  /**
   * Abre el diálogo para crear o editar etiqueta
   */
  const handleOpenDialog = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setTagName(tag.name);
      setTagColor(tag.color);
    } else {
      setEditingTag(null);
      setTagName("");
      setTagColor(TAG_COLORS[0].value);
    }
    setOpenDialog(true);
  };

  /**
   * Guarda la etiqueta (crear o actualizar)
   */
  const handleSaveTag = async () => {
    if (!tagName.trim()) return;

    try {
      if (editingTag) {
        // Actualizar etiqueta existente
        const response = await fetch(
          `${API_URL}${API_ENDPOINTS.tags.update(editingTag.id)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: tagName,
              color: tagColor,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Error al actualizar la bandera");
        }

        const result = await response.json();

        setTags(
          tags.map((t) =>
            t.id === editingTag.id
              ? {
                  ...t,
                  name: tagName,
                  color: tagColor,
                  updated_at: result.updated_at || new Date(),
                }
              : t
          )
        );
        showSnackbar("Bandera actualizada correctamente");
      } else {
        // Crear nueva etiqueta
        const response = await fetch(`${API_URL}${API_ENDPOINTS.tags.create}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: tagName,
            color: tagColor,
          }),
        });

        if (!response.ok) {
          console.log("CREACION DE TAGGG", response);
          throw new Error("Error al crear la bandera");
        }

        const result = await response.json();

        // Normalizamos el ID del nuevo tag
        const newTag = {
          id: result._id || result.id,
          name: result.name || tagName,
          color: result.color || tagColor,
          created_at: result.created_at || new Date(),
          updated_at: result.updated_at || new Date(),
        };

        setTags([...tags, newTag]);
        showSnackbar("Bandera creada correctamente");
      }

      setOpenDialog(false);
      setTagName("");
      setTagColor(TAG_COLORS[0].value);
    } catch (error) {
      console.error("Error al guardar etiquetaaaaaaa:", error);
      showSnackbar(error.message || "Error al guardar la bandera", "error");
    }
  };

  /**
   * Elimina una etiqueta
   */
  const handleDeleteTag = async (tagId) => {
    if (!confirm("¿Estás seguro de eliminar esta bandera?")) return;

    try {
      const response = await fetch(
        `${API_URL}${API_ENDPOINTS.tags.delete(tagId)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar la bandera");
      }

      setTags(tags.filter((t) => t.id !== tagId));
      showSnackbar("Bandera eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar bandera:", error);
      showSnackbar(error.message || "Error al eliminar la bandera", "error");
    }
  };

  if (loading) {
    return (
      <Box
        className="tag-manager"
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="tag-manager">
      <Box className="tag-manager__header">
        <Typography variant="h6">Banderas del Sistema</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className="tag-manager__add-button"
        >
          Nueva Bandera
        </Button>
      </Box>

      {tags.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No hay etiquetas creadas. ¡Crea tu primera etiqueta!
          </Typography>
        </Box>
      ) : (
        <List className="tag-manager__list">
          {tags.map((tag) => (
            <ListItem
              key={tag.id}
              className="tag-manager__list-item"
              secondaryAction={
                <Box className="tag-manager__actions">
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(tag)}
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteTag(tag.id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <Chip
                label={tag.name}
                sx={{ bgcolor: tag.color, color: "white", mr: 2 }}
              />
              <ListItemText
                primary={tag.name}
                secondary={`Color: ${tag.color}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Dialog para crear/editar etiqueta */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTag ? "Editar Bandera" : "Nueva Bandera"}
        </DialogTitle>
        <DialogContent>
          <Box className="tag-manager__dialog-content">
            <TextField
              label="Nombre de la bandera"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              fullWidth
              autoFocus
              sx={{ mt: 1 }}
            />

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Selecciona un color:
            </Typography>
            <Box className="tag-manager__color-picker">
              {TAG_COLORS.map((color) => (
                <Box
                  key={color.value}
                  className={`tag-manager__color-option ${
                    tagColor === color.value
                      ? "tag-manager__color-option--selected"
                      : ""
                  }`}
                  sx={{ bgcolor: color.value }}
                  onClick={() => setTagColor(color.value)}
                  title={color.name}
                />
              ))}
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Vista previa:
              </Typography>
              <Chip
                label={tagName || "Etiqueta"}
                sx={{ bgcolor: tagColor, color: "white" }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveTag}
            variant="contained"
            disabled={!tagName.trim()}
          >
            {editingTag ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
