"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Autocomplete,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlagIcon from "@mui/icons-material/Flag";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const PREDEFINED_FLAGS = [
  { id: "1", name: "Alta prioridad", color: "#ef4444" },
  { id: "2", name: "Media prioridad", color: "#f59e0b" },
  { id: "3", name: "Baja prioridad", color: "#10b981" },
  { id: "4", name: "Urgente", color: "#dc2626" },
  { id: "5", name: "Revisión pendiente", color: "#8b5cf6" },
  { id: "6", name: "Aprobado", color: "#06b6d4" },
];

/**
 * COMPONENTE: HierarchyWizard
 * PROPÓSITO: Wizard para crear elementos jerárquicos (Objetivo → Producto → Actividad → Subactividad)
 *
 * FLUJO:
 * 1. Crear Objetivo Específico (con banderas opcionales)
 * 2. Opción de agregar Producto (con banderas opcionales)
 * 3. Si tiene producto, crear Actividades (una o varias, con banderas)
 * 4. Cada actividad puede tener Sub-actividades (con banderas)
 * 5. Botones: "Continuar" (siguiente paso) o "Finalizar" (guardar y cerrar)
 */
export default function HierarchyWizard({ open, onClose, onSave }) {
  const [currentStep, setCurrentStep] = useState(0);

  // Objetivo Específico
  const [objetivoEspecifico, setObjetivoEspecifico] = useState("");
  const [objetivoFlags, setObjetivoFlags] = useState([]);

  // Producto (opcional)
  const [tieneProducto, setTieneProducto] = useState(false);
  const [producto, setProducto] = useState("");
  const [productoFlags, setProductoFlags] = useState([]);

  // Actividades (múltiples)
  const [actividades, setActividades] = useState([
    { id: Date.now(), nombre: "", flags: [], subactividades: [] },
  ]);
  const [actividadActual, setActividadActual] = useState(0);

  // Subactividades (múltiples por actividad)
  const [subactividadTemporal, setSubactividadTemporal] = useState("");
  const [subactividadFlags, setSubactividadFlags] = useState([]);

  const steps = [
    "Objetivo Específico",
    "Producto",
    "Actividades",
    "Sub-actividades",
  ];

  const handleAddActividad = () => {
    setActividades([
      ...actividades,
      { id: Date.now(), nombre: "", flags: [], subactividades: [] },
    ]);
  };

  const handleUpdateActividad = (index, nombre, flags) => {
    const updated = [...actividades];
    updated[index] = { ...updated[index], nombre, flags };
    setActividades(updated);
  };

  const handleDeleteActividad = (index) => {
    if (actividades.length > 1) {
      setActividades(actividades.filter((_, i) => i !== index));
      if (actividadActual >= actividades.length - 1) {
        setActividadActual(Math.max(0, actividadActual - 1));
      }
    }
  };

  const handleAddSubactividad = () => {
    if (subactividadTemporal.trim()) {
      const updated = [...actividades];
      updated[actividadActual].subactividades.push({
        id: Date.now(),
        nombre: subactividadTemporal,
        flags: subactividadFlags,
      });
      setActividades(updated);
      setSubactividadTemporal("");
      setSubactividadFlags([]);
    }
  };

  const handleDeleteSubactividad = (actividadIndex, subIndex) => {
    const updated = [...actividades];
    updated[actividadIndex].subactividades = updated[
      actividadIndex
    ].subactividades.filter((_, i) => i !== subIndex);
    setActividades(updated);
  };

  const handleNext = () => {
    if (currentStep === 0 && objetivoEspecifico.trim()) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setCurrentStep(2);
    } else if (
      currentStep === 2 &&
      actividades[actividadActual]?.nombre.trim()
    ) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Guardar todo
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    const hierarchy = {
      objetivoEspecifico: {
        nombre: objetivoEspecifico,
        flags: objetivoFlags,
      },
      producto: tieneProducto
        ? {
            nombre: producto,
            flags: productoFlags,
          }
        : null,
      actividades: actividades
        .filter((a) => a.nombre.trim())
        .map((a) => ({
          nombre: a.nombre,
          flags: a.flags,
          subactividades: a.subactividades,
        })),
    };
    onSave(hierarchy);
    handleReset();
  };

  const handleReset = () => {
    setCurrentStep(0);
    setObjetivoEspecifico("");
    setObjetivoFlags([]);
    setTieneProducto(false);
    setProducto("");
    setProductoFlags([]);
    setActividades([
      { id: Date.now(), nombre: "", flags: [], subactividades: [] },
    ]);
    setActividadActual(0);
    setSubactividadTemporal("");
    setSubactividadFlags([]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          minHeight: 600,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={onClose} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Crear Elementos del Proyecto
        </Typography>
      </Box>

      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <DialogContent>
        {/* PASO 1: Objetivo Específico */}
        {currentStep === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6">Crear Objetivo Específico</Typography>
            <TextField
              fullWidth
              variant="outlined"
              label="Nombre del objetivo específico"
              value={objetivoEspecifico}
              onChange={(e) => setObjetivoEspecifico(e.target.value)}
              placeholder="Ej: Mejorar la infraestructura tecnológica"
              multiline
              rows={3}
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Banderas (opcional)
              </Typography>
              <Autocomplete
                multiple
                options={PREDEFINED_FLAGS}
                getOptionLabel={(option) => option.name}
                value={objetivoFlags}
                onChange={(e, newValue) => setObjetivoFlags(newValue)}
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
        )}

        {/* PASO 2: Producto */}
        {currentStep === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6">Producto (opcional)</Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={tieneProducto}
                  onChange={(e) => setTieneProducto(e.target.checked)}
                />
              }
              label="Este objetivo tiene un producto"
            />

            {tieneProducto && (
              <>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Nombre del producto"
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                  placeholder="Ej: Sistema de gestión implementado"
                  multiline
                  rows={2}
                />

                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Banderas (opcional)
                  </Typography>
                  <Autocomplete
                    multiple
                    options={PREDEFINED_FLAGS}
                    getOptionLabel={(option) => option.name}
                    value={productoFlags}
                    onChange={(e, newValue) => setProductoFlags(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Selecciona banderas"
                      />
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
              </>
            )}
          </Box>
        )}

        {/* PASO 3: Actividades */}
        {currentStep === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Actividades</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddActividad}
                variant="outlined"
                size="small"
              >
                Nueva Actividad
              </Button>
            </Box>

            {actividades.map((actividad, index) => (
              <Box
                key={actividad.id}
                sx={{
                  p: 2,
                  border:
                    index === actividadActual
                      ? "2px solid #7c4dff"
                      : "1px solid #e0e0e0",
                  borderRadius: 2,
                  bgcolor: index === actividadActual ? "#f5f3ff" : "white",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2">
                    Actividad {index + 1}
                  </Typography>
                  {actividades.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteActividad(index)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <TextField
                  fullWidth
                  variant="outlined"
                  label="Nombre de la actividad"
                  value={actividad.nombre}
                  onChange={(e) =>
                    handleUpdateActividad(
                      index,
                      e.target.value,
                      actividad.flags
                    )
                  }
                  placeholder="Ej: Capacitar al personal"
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                  onFocus={() => setActividadActual(index)}
                />

                <Autocomplete
                  multiple
                  options={PREDEFINED_FLAGS}
                  getOptionLabel={(option) => option.name}
                  value={actividad.flags}
                  onChange={(e, newValue) =>
                    handleUpdateActividad(index, actividad.nombre, newValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Banderas (opcional)"
                      size="small"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.name}
                        icon={<FlagIcon />}
                        size="small"
                        sx={{ bgcolor: option.color, color: "white" }}
                      />
                    ))
                  }
                />
              </Box>
            ))}
          </Box>
        )}

        {/* PASO 4: Sub-actividades */}
        {currentStep === 3 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6">
              Sub-actividades de:{" "}
              {actividades[actividadActual]?.nombre || "Actividad"}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Nombre de la sub-actividad"
                value={subactividadTemporal}
                onChange={(e) => setSubactividadTemporal(e.target.value)}
                placeholder="Ej: Preparar material de capacitación"
                multiline
                rows={2}
              />

              <Autocomplete
                multiple
                options={PREDEFINED_FLAGS}
                getOptionLabel={(option) => option.name}
                value={subactividadFlags}
                onChange={(e, newValue) => setSubactividadFlags(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Banderas (opcional)"
                    size="small"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name}
                      icon={<FlagIcon />}
                      size="small"
                      sx={{ bgcolor: option.color, color: "white" }}
                    />
                  ))
                }
              />

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSubactividad}
                disabled={!subactividadTemporal.trim()}
                sx={{ alignSelf: "flex-start" }}
              >
                Agregar Sub-actividad
              </Button>
            </Box>

            {actividades[actividadActual]?.subactividades.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Sub-actividades agregadas:
                </Typography>
                {actividades[actividadActual].subactividades.map(
                  (sub, subIndex) => (
                    <Box
                      key={sub.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        mb: 1,
                        bgcolor: "#f9fafb",
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2">{sub.nombre}</Typography>
                        {sub.flags.length > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              mt: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            {sub.flags.map((flag) => (
                              <Chip
                                key={flag.id}
                                label={flag.name}
                                size="small"
                                icon={<FlagIcon />}
                                sx={{
                                  bgcolor: flag.color,
                                  color: "white",
                                  height: 20,
                                  fontSize: "0.7rem",
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleDeleteSubactividad(actividadActual, subIndex)
                        }
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Botones de navegación */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outlined"
          >
            Atrás
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button onClick={handleFinish} variant="outlined" color="success">
              Finalizar
            </Button>
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={
                (currentStep === 0 && !objetivoEspecifico.trim()) ||
                (currentStep === 1 && tieneProducto && !producto.trim()) ||
                (currentStep === 2 &&
                  !actividades[actividadActual]?.nombre.trim())
              }
            >
              {currentStep === 3 ? "Finalizar" : "Continuar"}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
