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
 * Tabla: tags
 * Campos: id, name, color, created_at, updated_at
 *
 * API Endpoints:
 * - GET /api/tags - Listar todas las etiquetas
 * - POST /api/tags - Crear nueva etiqueta
 * - PUT /api/tags/:id - Actualizar etiqueta
 * - DELETE /api/tags/:id - Eliminar etiqueta
 */

import { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "./TagManager.css";

// Colores predefinidos para etiquetas
const TAG_COLORS = [
  { name: "Rojo", value: "#ef5350" },
  { name: "Rosa", value: "#ec407a" },
  { name: "Púrpura", value: "#ab47bc" },
  { name: "Azul", value: "#42a5f5" },
  { name: "Verde", value: "#66bb6a" },
  { name: "Amarillo", value: "#ffee58" },
  { name: "Naranja", value: "#ffa726" },
];

export default function TagManager() {
  const [tags, setTags] = useState([
    { id: "1", name: "Costo", color: "#ffa726" },
    { id: "2", name: "Revisar", color: "#ffee58" },
    { id: "3", name: "Factibilidad", color: "#66bb6a" },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(TAG_COLORS[0].value);

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
   * TODO: Conectar con API para persistir en BD
   */
  const handleSaveTag = () => {
    if (!tagName.trim()) return;

    if (editingTag) {
      // Actualizar etiqueta existente
      setTags(
        tags.map((t) =>
          t.id === editingTag.id ? { ...t, name: tagName, color: tagColor } : t
        )
      );
    } else {
      // Crear nueva etiqueta
      const newTag = {
        id: Date.now().toString(),
        name: tagName,
        color: tagColor,
      };
      setTags([...tags, newTag]);
    }

    setOpenDialog(false);
    setTagName("");
    setTagColor(TAG_COLORS[0].value);
  };

  /**
   * Elimina una etiqueta
   * TODO: Conectar con API para eliminar de BD
   */
  const handleDeleteTag = (tagId) => {
    if (confirm("¿Estás seguro de eliminar esta etiqueta?")) {
      setTags(tags.filter((t) => t.id !== tagId));
    }
  };

  return (
    <Box className="tag-manager">
      <Box className="tag-manager__header">
        <Typography variant="h6">Etiquetas del Sistema</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className="tag-manager__add-button"
        >
          Nueva Etiqueta
        </Button>
      </Box>

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

      {/* Dialog para crear/editar etiqueta */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTag ? "Editar Etiqueta" : "Nueva Etiqueta"}
        </DialogTitle>
        <DialogContent>
          <Box className="tag-manager__dialog-content">
            <TextField
              label="Nombre de la etiqueta"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              fullWidth
              autoFocus
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
    </Box>
  );
}
