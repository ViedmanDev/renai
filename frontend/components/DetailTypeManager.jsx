"use client";

/**
 * COMPONENTE: DetailTypeManager
 * PROPÓSITO: Gestión CRUD de tipos de detalles personalizados del sistema
 *
 * FUNCIONALIDADES:
 * - Crear nuevos tipos de detalles con configuración personalizada
 * - Editar tipos de detalles existentes
 * - Eliminar tipos de detalles
 * - Visualizar todos los tipos de detalles
 *
 * CONEXIÓN A BD:
 * Colección: detailtypes
 * Campos: id, name, icon, hasSubOptions, subOptionsType, subOptions, requiresValue, valueType
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "./DetailTypeManager.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const SUB_OPTIONS_TYPES = [
  { value: "field", label: "Campo de texto" },
  { value: "numeric", label: "Numérico" },
  { value: "list", label: "Lista" },
  { value: "date", label: "Fecha" },
];

const VALUE_TYPES = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
];

const ICON_OPTIONS = [
  "📄",
  "📊",
  "📝",
  "🔢",
  "📅",
  "📎",
  "🚩",
  "⚙️",
  "📋",
  "💼",
  "🎯",
  "⚖️",
  "📦",
  "💰",
  "💵",
];

export default function DetailTypeManager() {
  const [detailTypes, setDetailTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📄");
  const [hasSubOptions, setHasSubOptions] = useState(false);
  const [subOptionsType, setSubOptionsType] = useState("");
  const [requiresValue, setRequiresValue] = useState(false);
  const [valueType, setValueType] = useState("");

  // Cargar tipos de detalles al montar
  useEffect(() => {
    fetchDetailTypes();
  }, []);

  const fetchDetailTypes = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/detail-types`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(
          "Error HTTP al cargar detailtypes:",
          response.status,
          text
        );
        throw new Error("No se pudieron cargar los tipos de detalle");
      }

      const data = await response.json();

      // adapta esto según te responda el backend
      setDetailTypes(Array.isArray(data) ? data : data.data);
    } catch (error) {
      console.error("[v0] Error fetching detail types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type = null) => {
    if (type) {
      setEditingType(type);
      setName(type.name);
      setIcon(type.icon || "📄");
      setHasSubOptions(type.hasSubOptions || false);
      setSubOptionsType(type.subOptionsType || "");
      setRequiresValue(type.requiresValue || false);
      setValueType(type.valueType || "");
    } else {
      setEditingType(null);
      setName("");
      setIcon("📄");
      setHasSubOptions(false);
      setSubOptionsType("");
      setRequiresValue(false);
      setValueType("");
    }
    setError("");
    setOpenDialog(true);
  };

  const handleSaveType = async () => {
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    try {
      const body = {
        name,
        icon,
        hasSubOptions,
        subOptionsType: hasSubOptions ? subOptionsType : null,
        requiresValue,
        valueType: requiresValue ? valueType : null,
      };

      let response;
      if (editingType) {
        // Actualizar
        response = await fetch(`${API_URL}/detail-types/${editingType.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        // Crear
        response = await fetch(`${API_URL}/detail-types`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = await response.json();
      if (data.success) {
        await fetchDetailTypes();
        setOpenDialog(false);
      } else {
        setError(data.error || "Error al guardar el tipo de detalle");
      }
    } catch (error) {
      console.error("[v0] Error saving detail type:", error);
      setError("Error al guardar el tipo de detalle");
    }
  };

  const handleDeleteType = async (typeId) => {
    if (!confirm("¿Estás seguro de eliminar este tipo de detalle?")) return;

    try {
      const response = await fetch(`${API_URL}/detail-types/${typeId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        await fetchDetailTypes();
      }
    } catch (error) {
      console.error("[v0] Error deleting detail type:", error);
    }
  };

  if (loading) {
    return (
      <Box className="detail-type-manager">
        <Typography>Cargando tipos de detalles...</Typography>
      </Box>
    );
  }

  return (
    <Box className="detail-type-manager">
      <Box className="detail-type-manager__header">
        <Typography variant="h6">Tipos de Detalles Personalizados</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className="detail-type-manager__add-button"
        >
          Nuevo Tipo
        </Button>
      </Box>

      <List className="detail-type-manager__list">
        {detailTypes.map((type) => (
          <ListItem
            key={type.id}
            className="detail-type-manager__list-item"
            secondaryAction={
              <Box className="detail-type-manager__actions">
                <IconButton
                  edge="end"
                  onClick={() => handleOpenDialog(type)}
                  size="small"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteType(type.id)}
                  size="small"
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span style={{ fontSize: "1.5rem" }}>{type.icon}</span>
                  {type.name}
                  {type.hasSubOptions && (
                    <Chip
                      label="Con subopciones"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {type.requiresValue && (
                    <Chip
                      label="Requiere valor"
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </Box>
              }
              secondary={
                <>
                  <Typography variant="caption" color="text.secondary">
                    ID: {type.id}
                  </Typography>
                  {type.hasSubOptions && (
                    <Typography variant="caption" display="block">
                      Tipo de subopción: {type.subOptionsType}
                    </Typography>
                  )}
                  {type.requiresValue && (
                    <Typography variant="caption" display="block">
                      Tipo de valor: {type.valueType}
                    </Typography>
                  )}
                </>
              }
            />
          </ListItem>
        ))}

        {detailTypes.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No hay tipos de detalles personalizados aún
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Haz clic en "Nuevo Tipo" para crear uno
            </Typography>
          </Box>
        )}
      </List>

      {/* Dialog para crear/editar tipo de detalle */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingType ? "Editar Tipo de Detalle" : "Nuevo Tipo de Detalle"}
        </DialogTitle>
        <DialogContent>
          <Box className="detail-type-manager__dialog-content">
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Nombre del tipo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              autoFocus
            />

            <FormControl fullWidth>
              <InputLabel>Icono</InputLabel>
              <Select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                label="Icono"
              >
                {ICON_OPTIONS.map((ico) => (
                  <MenuItem key={ico} value={ico}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span style={{ fontSize: "1.5rem" }}>{ico}</span>
                      {ico}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={hasSubOptions}
                  onChange={(e) => setHasSubOptions(e.target.checked)}
                />
              }
              label="Tiene subopciones"
            />

            {hasSubOptions && (
              <FormControl fullWidth>
                <InputLabel>Tipo de subopción</InputLabel>
                <Select
                  value={subOptionsType}
                  onChange={(e) => setSubOptionsType(e.target.value)}
                  label="Tipo de subopción"
                >
                  {SUB_OPTIONS_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={requiresValue}
                  onChange={(e) => setRequiresValue(e.target.checked)}
                />
              }
              label="Requiere valor"
            />

            {requiresValue && (
              <FormControl fullWidth>
                <InputLabel>Tipo de valor</InputLabel>
                <Select
                  value={valueType}
                  onChange={(e) => setValueType(e.target.value)}
                  label="Tipo de valor"
                >
                  {VALUE_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveType}
            variant="contained"
            disabled={!name.trim()}
          >
            {editingType ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
