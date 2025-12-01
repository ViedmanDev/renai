"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  FormControl,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FlagIcon from "@mui/icons-material/Flag";

const PREDEFINED_FLAGS = [
  { id: "1", name: "Alta prioridad", color: "#ef4444" },
  { id: "2", name: "Media prioridad", color: "#f59e0b" },
  { id: "3", name: "Baja prioridad", color: "#10b981" },
  { id: "4", name: "Urgente", color: "#dc2626" },
  { id: "5", name: "Revisión pendiente", color: "#8b5cf6" },
  { id: "6", name: "Aprobado", color: "#06b6d4" },
];

const DATA_TYPES = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "boolean", label: "Sí/No" },
  { value: "currency", label: "Moneda" },
];

const CURRENCY_TYPES = [
  { value: "COP", label: "Pesos Colombianos (COP)" },
  { value: "USD", label: "Dólares (USD)" },
  { value: "EUR", label: "Euros (EUR)" },
];

export default function CreateDetailModal({
  open,
  onClose,
  onSave,
  subElementName,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [required, setRequired] = useState(false);
  const [dataType, setDataType] = useState("text");
  const [currencyType, setCurrencyType] = useState("COP");
  const [value, setValue] = useState("");
  const [flags, setFlags] = useState([]);

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        description: description.trim(),
        required,
        dataType,
        currencyType:
          dataType === "currency" || dataType === "number"
            ? currencyType
            : undefined,
        value: value || undefined,
        flags,
      });
      handleReset();
    }
    onClose();
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setRequired(false);
    setDataType("text");
    setCurrencyType("COP");
    setValue("");
    setFlags([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const renderValueField = () => {
    switch (dataType) {
      case "text":
        return (
          <TextField
            fullWidth
            label="Valor"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ingrese el texto"
          />
        );
      case "number":
        return (
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de moneda</InputLabel>
              <Select
                value={currencyType}
                onChange={(e) => setCurrencyType(e.target.value)}
                label="Tipo de moneda"
              >
                {CURRENCY_TYPES.map((curr) => (
                  <MenuItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Valor"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
            />
          </Box>
        );
      case "currency":
        return (
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Moneda</InputLabel>
              <Select
                value={currencyType}
                onChange={(e) => setCurrencyType(e.target.value)}
                label="Moneda"
              >
                {CURRENCY_TYPES.map((curr) => (
                  <MenuItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Monto"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
            />
          </Box>
        );
      case "date":
        return (
          <TextField
            fullWidth
            label="Fecha"
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        );
      case "boolean":
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={value === "true"}
                onChange={(e) => setValue(e.target.checked ? "true" : "false")}
              />
            }
            label="Sí"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Crear Detalle de: {subElementName}
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
          <TextField
            fullWidth
            label="Nombre del detalle"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Presupuesto"
            required
            autoFocus
          />

          <TextField
            fullWidth
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción opcional"
            multiline
            rows={2}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
              />
            }
            label="Campo requerido"
          />

          <FormControl fullWidth>
            <InputLabel>Tipo de dato</InputLabel>
            <Select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              label="Tipo de dato"
            >
              {DATA_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {renderValueField()}

          <Box>
            <InputLabel sx={{ mb: 1 }}>Banderas (opcional)</InputLabel>
            <Autocomplete
              multiple
              options={PREDEFINED_FLAGS}
              getOptionLabel={(option) => option.name}
              value={flags}
              onChange={(e, newValue) => setFlags(newValue)}
              renderInput={(params) => (
                <TextField {...params} placeholder="Selecciona banderas" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.name}
                    icon={<FlagIcon />}
                    sx={{ bgcolor: option.color, color: "white" }}
                  />
                ))
              }
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name.trim()}
        >
          Crear Detalle
        </Button>
      </DialogActions>
    </Dialog>
  );
}
