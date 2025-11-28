"use client";

/**
 * COMPONENTE: ParameterManager
 * PROPÓSITO: Gestión CRUD de parámetros personalizados del sistema
 *
 * FUNCIONALIDADES:
 * - Crear nuevos parámetros con nombre, tipo y valor por defecto
 * - Editar parámetros existentes
 * - Eliminar parámetros
 * - Visualizar todos los parámetros
 *
 * CONEXIÓN A BD:
 * Tabla: custom_parameters
 * Campos: id, name, type, default_value, description, created_at
 *
 * TIPOS DE PARÁMETROS:
 * - text: Texto simple
 * - number: Número
 * - boolean: Sí/No
 * - date: Fecha
 * - select: Lista de opciones
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "./ParameterManager.css";

const PARAMETER_TYPES = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "boolean", label: "Sí/No" },
  { value: "date", label: "Fecha" },
  { value: "select", label: "Lista de opciones" },
];

export default function ParameterManager() {
  const [parameters, setParameters] = useState([
    {
      id: "1",
      name: "Presupuesto máximo",
      type: "number",
      defaultValue: "0",
      description: "Presupuesto máximo del proyecto",
    },
    {
      id: "2",
      name: "Requiere aprobación",
      type: "boolean",
      defaultValue: "true",
      description: "Si el proyecto requiere aprobación",
    },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingParameter, setEditingParameter] = useState(null);
  const [paramName, setParamName] = useState("");
  const [paramType, setParamType] = useState("text");
  const [paramDefaultValue, setParamDefaultValue] = useState("");
  const [paramDescription, setParamDescription] = useState("");

  const handleOpenDialog = (parameter = null) => {
    if (parameter) {
      setEditingParameter(parameter);
      setParamName(parameter.name);
      setParamType(parameter.type);
      setParamDefaultValue(parameter.defaultValue);
      setParamDescription(parameter.description);
    } else {
      setEditingParameter(null);
      setParamName("");
      setParamType("text");
      setParamDefaultValue("");
      setParamDescription("");
    }
    setOpenDialog(true);
  };

  const handleSaveParameter = () => {
    if (!paramName.trim()) return;

    if (editingParameter) {
      setParameters(
        parameters.map((p) =>
          p.id === editingParameter.id
            ? {
                ...p,
                name: paramName,
                type: paramType,
                defaultValue: paramDefaultValue,
                description: paramDescription,
              }
            : p
        )
      );
    } else {
      const newParameter = {
        id: Date.now().toString(),
        name: paramName,
        type: paramType,
        defaultValue: paramDefaultValue,
        description: paramDescription,
      };
      setParameters([...parameters, newParameter]);
    }

    setOpenDialog(false);
  };

  const handleDeleteParameter = (parameterId) => {
    if (confirm("¿Estás seguro de eliminar este parámetro?")) {
      setParameters(parameters.filter((p) => p.id !== parameterId));
    }
  };

  const getTypeLabel = (type) => {
    return PARAMETER_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <Box className="parameter-manager">
      <Box className="parameter-manager__header">
        <Typography variant="h6">Parámetros Personalizados</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className="parameter-manager__add-button"
        >
          Nuevo Parámetro
        </Button>
      </Box>

      <List className="parameter-manager__list">
        {parameters.map((param) => (
          <ListItem
            key={param.id}
            className="parameter-manager__list-item"
            secondaryAction={
              <Box className="parameter-manager__actions">
                <IconButton
                  edge="end"
                  onClick={() => handleOpenDialog(param)}
                  size="small"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteParameter(param.id)}
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
                  {param.name}
                  <Chip
                    label={getTypeLabel(param.type)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <>
                  {param.description && (
                    <Typography
                      variant="body2"
                      component="span"
                      display="block"
                    >
                      {param.description}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component="span"
                  >
                    Valor por defecto: {param.defaultValue || "Sin valor"}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingParameter ? "Editar Parámetro" : "Nuevo Parámetro"}
        </DialogTitle>
        <DialogContent>
          <Box className="parameter-manager__dialog-content">
            <TextField
              label="Nombre del parámetro"
              value={paramName}
              onChange={(e) => setParamName(e.target.value)}
              fullWidth
              autoFocus
            />

            <FormControl fullWidth>
              <InputLabel>Tipo de parámetro</InputLabel>
              <Select
                value={paramType}
                onChange={(e) => setParamType(e.target.value)}
                label="Tipo de parámetro"
              >
                {PARAMETER_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Valor por defecto"
              value={paramDefaultValue}
              onChange={(e) => setParamDefaultValue(e.target.value)}
              fullWidth
            />

            <TextField
              label="Descripción"
              value={paramDescription}
              onChange={(e) => setParamDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveParameter}
            variant="contained"
            disabled={!paramName.trim()}
          >
            {editingParameter ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
