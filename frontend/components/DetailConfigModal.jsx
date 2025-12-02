"use client";

/**
 * COMPONENTE: DetailConfigModal
 * PROPÓSITO: Modal avanzado para configurar parámetros de cada detalle
 *
 * PROPS:
 * - open (boolean): Controla visibilidad
 * - onClose (function): Callback al cerrar
 * - detail (object): Detalle a configurar
 * - onSave (function): Callback al guardar configuración
 *
 * CONFIGURACIONES DISPONIBLES:
 * - Nombre del campo personalizado
 * - Banderas/etiquetas asociadas
 * - Privacidad (quién puede ver el campo)
 * - Decimales (para numéricos)
 * - Valor inicial (para campos que lo requieren)
 *
 * CONEXIÓN A BD:
 * Guardar en: project_detail_configs
 * Campos: detail_id, field_name, flags (JSON), privacy, decimals, initial_value
 *
 * Relación con banderas: project_detail_flags (many-to-many)
 * - detail_id (FK)
 * - flag_id (FK)
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { PREDEFINED_FLAGS } from "@/constants/detailTypes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function DetailConfigModal({ open, onClose, detail, onSave }) {
  //Estado para banderas desde API
  const [systemFlags, setSystemFlags] = useState([]);
  const [loadingFlags, setLoadingFlags] = useState(false);
  // Estados para configuración del detalle
  const [fieldName, setFieldName] = useState("");
  const [description, setDescription] = useState("");
  const [decimals, setDecimals] = useState(2);
  const [selectedFlags, setSelectedFlags] = useState([]);
  //const [privacy, setPrivacy] = useState("grupo");
  const [searchFlag, setSearchFlag] = useState("");
  const [initialValue, setInitialValue] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [textValue, setTextValue] = useState("");
  const [booleanValue, setBooleanValue] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [selectedList, setSelectedList] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [criticalPath, setCriticalPath] = useState("");
  const [productName, setProductName] = useState("");
  const [productIndicator, setProductIndicator] = useState("");

  // ✅ Cargar banderas del sistema cuando se abre el modal
  useEffect(() => {
    if (open) {
      fetchSystemFlags();
    }
  }, [open]);

  // ✅ Función para cargar banderas desde el backend
  const fetchSystemFlags = async () => {
    try {
      setLoadingFlags(true);
      const response = await fetch(`${API_URL}/tags`);

      if (response.ok) {
        const tags = await response.json();

        // Normalizar formato de tags
        const normalizedFlags = tags.map((tag) => ({
          id: tag._id || tag.id,
          name: tag.name,
          color: tag.color,
        }));

        setSystemFlags(normalizedFlags);
        console.log("✅ Banderas cargadas:", normalizedFlags.length);
      } else {
        console.error("❌ Error al cargar banderas:", response.status);
      }
    } catch (error) {
      console.error("❌ Error de red al cargar banderas:", error);
    } finally {
      setLoadingFlags(false);
    }
  };
  useEffect(() => {
    if (detail && open) {
      console.log("Detail que entra al modal: ", detail);

      // Nombre / descripción
      setFieldName(detail.fieldName || detail.name || "");
      setDescription(detail.description || "");

      // Valor genérico que viene del detalle
      const incomingValue = detail.value ?? detail.initialValue ?? "";

      // NUMÉRICOS / MONEDA
      setInitialValue(incomingValue);

      // FECHA
      if (detail.dataType === "date" || detail.id === "fecha") {
        // si no hay detail.date, usa el value
        setDateValue(detail.date || incomingValue || "");
        setStartDate(detail.startDate || "");
        setEndDate(detail.endDate || "");
      } else {
        setDateValue(detail.date || "");
        setStartDate(detail.startDate || "");
        setEndDate(detail.endDate || "");
      }

      // TEXTO
      if (
        detail.dataType === "text" ||
        detail.id === "texto" ||
        detail.id === "campo"
      ) {
        setTextValue(detail.textValue ?? incomingValue ?? "");
      } else {
        setTextValue(detail.textValue || "");
      }
      // BOOLEAN (sí / no)
      let incomingBoolean = false;

      // Si ya viene como booleano
      if (typeof detail.booleanValue === "boolean") {
        incomingBoolean = detail.booleanValue;
      } else if (typeof detail.value === "boolean") {
        incomingBoolean = detail.value;
      } else if (typeof detail.value === "string") {
        // Por si lo estás guardando como "true"/"false"
        if (detail.value.toLowerCase() === "true") incomingBoolean = true;
        if (detail.value.toLowerCase() === "false") incomingBoolean = false;
      }

      setBooleanValue(incomingBoolean);

      // Otros campos
      setDecimals(detail.decimals || 2);
      setSelectedFlags(detail.flags || []);
      //setPrivacy(detail.privacy || "grupo");
      setAttachments(detail.attachments || []);
      setSelectedList(detail.selectedList || "");
      setInternalNote(detail.internalNote || "");
      setCriticalPath(detail.criticalPath || "");
      setProductName(detail.productName || "");
      setProductIndicator(detail.productIndicator || "");
    }
  }, [detail, open]);

  const handleSave = () => {
    const isBooleanDetail =
      detail.dataType === "boolean" || detail.id === "si_no";
    const isTextField =
      detail.dataType === "text" ||
      detail.id === "texto" ||
      detail.id === "campo";

    const config = {
      ...detail,
      // Actualizar el nombre del detalle
      name: fieldName || detail.name,
      fieldName,
      description,
      decimals,
      flags: selectedFlags,

      // VALOR PRINCIPAL según el tipo de campo
      value: (() => {
        if (isBooleanDetail) return booleanValue;
        if (isTextField) return textValue;
        return initialValue;
      })(),

      // Valores específicos por tipo
      initialValue: isBooleanDetail ? undefined : initialValue,
      date: dateValue,
      startDate: startDate,
      endDate: endDate,
      textValue: textValue,
      booleanValue: booleanValue,
      attachments: attachments,
      selectedList: selectedList,
      internalNote: internalNote,
      criticalPath: criticalPath,
      productName: productName,
      productIndicator: productIndicator,
    };

    console.log("💾 Guardando config completa:", config);
    onSave(config);
    handleClose();
  };

  const handleClose = () => {
    setFieldName("");
    setDescription("");
    setDecimals(2);
    setSelectedFlags([]);
    //setPrivacy("grupo");
    setSearchFlag("");
    setInitialValue("");
    setDateValue("");
    setStartDate("");
    setEndDate("");
    setTextValue("");
    setBooleanValue(false);
    setAttachments([]);
    setSelectedList("");
    setInternalNote("");
    setCriticalPath("");
    setProductName("");
    setProductIndicator("");
    onClose();
  };

  /**
   * Agrega o quita una bandera de la selección
   */
  const toggleFlag = (flag) => {
    if (selectedFlags.find((f) => f.id === flag.id)) {
      setSelectedFlags(selectedFlags.filter((f) => f.id !== flag.id));
    } else {
      setSelectedFlags([...selectedFlags, flag]);
    }
  };

  // Filtrar banderas según búsqueda
  const filteredFlags = systemFlags.filter((flag) =>
    flag.name.toLowerCase().includes(searchFlag.toLowerCase())
  );

  if (!detail) return null;

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: "70vh",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={handleClose}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Parámetros de {detail.name}
          </Typography>
        </Box>

        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 3,
            }}
          >
            {/* Columna 1: Nombre, decimales y valores según tipo */}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Ingresa nombre del campo
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="Nombre del campo"
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" gutterBottom>
                Descripción del campo
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Texto que se muestra debajo del nombre"
                sx={{ mb: 3 }}
              />
              {detail.id === "ruta_critica" && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Descripción de la ruta crítica
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    value={criticalPath}
                    onChange={(e) => setCriticalPath(e.target.value)}
                    placeholder="Describe la ruta crítica del proyecto"
                  />
                </Box>
              )}

              {/* Producto (id viejo) */}
              {detail.id === "producto" && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Nombre del producto
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ingresa el nombre del producto"
                  />
                </Box>
              )}

              {/* Indicador de producto (id viejo) */}
              {detail.id === "indicador_producto" && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Indicador del producto
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    value={productIndicator}
                    onChange={(e) => setProductIndicator(e.target.value)}
                    placeholder="Define el indicador del producto"
                  />
                </Box>
              )}

              {/* NUMÉRICO (id viejo "numerico" o dataType "number" / "currency") */}
              {(detail.id === "numerico" ||
                detail.dataType === "number" ||
                detail.dataType === "currency") && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Cantidad de decimales
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={decimals}
                      onChange={(e) =>
                        setDecimals(Number.parseInt(e.target.value) || 0)
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Box
                              sx={{ display: "flex", flexDirection: "column" }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => setDecimals((d) => d + 1)}
                                sx={{ p: 0 }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setDecimals((d) => Math.max(0, d - 1))
                                }
                                sx={{ p: 0 }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Valor numérico
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={initialValue}
                      onChange={(e) => setInitialValue(e.target.value)}
                      placeholder="Ingresa el valor"
                      inputProps={{
                        step: Math.pow(10, -decimals),
                      }}
                      InputProps={{
                        startAdornment: (() => {
                          // Soporta nuevo esquema (currencyType) y el viejo (selectedSubOption)
                          if (detail.currencyType === "USD") {
                            return (
                              <InputAdornment position="start">
                                USD
                              </InputAdornment>
                            );
                          }
                          if (detail.currencyType === "COP") {
                            return (
                              <InputAdornment position="start">
                                COP
                              </InputAdornment>
                            );
                          }
                          if (detail.selectedSubOption === "porcentaje") {
                            return (
                              <InputAdornment position="start">
                                %
                              </InputAdornment>
                            );
                          }
                          if (detail.selectedSubOption === "dolar") {
                            return (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            );
                          }
                          if (detail.selectedSubOption === "usd") {
                            return (
                              <InputAdornment position="start">
                                USD
                              </InputAdornment>
                            );
                          }
                          if (detail.selectedSubOption === "cop") {
                            return (
                              <InputAdornment position="start">
                                COP
                              </InputAdornment>
                            );
                          }
                          return null;
                        })(),
                      }}
                    />
                  </Box>
                </>
              )}

              {/* VALOR COTIZACIÓN / VENTA (ids viejos) */}
              {(detail.id === "valor_cotizacion" ||
                detail.id === "valor_venta") && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {detail.id === "valor_cotizacion"
                      ? "Valor de cotización"
                      : "Valor de venta"}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={initialValue}
                    onChange={(e) => setInitialValue(e.target.value)}
                    placeholder="Ingresa el valor"
                    inputProps={{
                      step: 0.01,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                  />
                </Box>
              )}

              {/* FECHA: id viejo "fecha" O dataType "date" */}
              {(detail.id === "fecha" || detail.dataType === "date") && (
                <Box sx={{ mb: 3 }}>
                  {detail.dateType === "date" ? (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Fecha de inicio
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="subtitle2" gutterBottom>
                        Fecha de fin
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Fecha
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </>
                  )}
                </Box>
              )}

              {/* TEXTO: ids viejos "texto" / "campo" O dataType "text" */}
              {(detail.id === "texto" ||
                detail.id === "campo" ||
                detail.dataType === "text") && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Contenido del texto
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    multiline={detail.selectedSubOption === "texto_largo"}
                    rows={detail.selectedSubOption === "texto_largo" ? 4 : 1}
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder="Ingresa el texto"
                  />
                </Box>
              )}

              {/* SÍ / NO: id viejo "si_no" O dataType "boolean" */}
              {(detail.id === "si_no" || detail.dataType === "boolean") && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Valor
                  </Typography>
                  <ToggleButtonGroup
                    value={booleanValue}
                    exclusive
                    onChange={(e, newValue) => {
                      if (newValue !== null) {
                        setBooleanValue(newValue);
                      }
                    }}
                    fullWidth
                  >
                    <ToggleButton value={true}>Sí</ToggleButton>
                    <ToggleButton value={false}>No</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              )}

              {/* PONDERACIÓN: id viejo + posible futuro dataType "percent" */}
              {(detail.id === "ponderacion" ||
                detail.dataType === "percent") && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Valor de ponderación (%)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={initialValue}
                    onChange={(e) => setInitialValue(e.target.value)}
                    placeholder="Ingresa el porcentaje"
                    inputProps={{
                      min: 0,
                      max: 100,
                      step: 0.1,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                </Box>
              )}

              {/* NOTA INTERNA: id viejo + posible dataType "note" */}
              {(detail.id === "nota_interna" || detail.dataType === "note") && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Nota interna
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={4}
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Escribe una nota interna"
                  />
                </Box>
              )}

              {/* ADJUNTOS: id viejo + posible dataType "attachments" */}
              {(detail.id === "adjuntos" ||
                detail.dataType === "attachments") && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Archivos adjuntos
                  </Typography>
                  <Button variant="outlined" component="label" fullWidth>
                    Seleccionar archivos
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setAttachments(files);
                      }}
                    />
                  </Button>
                  {attachments.length > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {attachments.length} archivo(s) seleccionado(s)
                    </Typography>
                  )}
                </Box>
              )}

              {/* DESDE LISTAS: id viejo + posible dataType "list" */}
              {(detail.id === "desde_listas" || detail.dataType === "list") && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Seleccionar de lista
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    value={selectedList}
                    onChange={(e) => setSelectedList(e.target.value)}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="lista1">Lista 1</option>
                    <option value="lista2">Lista 2</option>
                    <option value="lista3">Lista 3</option>
                  </TextField>
                </Box>
              )}
            </Box>

            {/* Columna 2: Banderas */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Banderas
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar banderas"
                value={searchFlag}
                onChange={(e) => setSearchFlag(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Box sx={{ mb: 2 }}>
                <ToggleButtonGroup size="small" sx={{ mb: 1 }}>
                  <ToggleButton value="todas">Todas</ToggleButton>
                  <ToggleButton value="usadas">Usadas</ToggleButton>
                  <ToggleButton value="recientes">Recientes</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                gutterBottom
              >
                Sugerencias
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {filteredFlags.slice(0, 2).map((flag) => (
                  <Chip
                    key={flag.id}
                    label={flag.name}
                    onClick={() => toggleFlag(flag)}
                    sx={{
                      bgcolor: flag.color,
                      color: "white",
                      "&:hover": {
                        bgcolor: flag.color,
                        opacity: 0.8,
                      },
                    }}
                  />
                ))}
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                gutterBottom
              >
                Banderas seleccionadas
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  maxHeight: 150,
                  overflowY: "auto",
                  p: 1,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  minHeight: 60,
                }}
              >
                {selectedFlags.length > 0 ? (
                  selectedFlags.map((flag) => (
                    <Chip
                      key={flag.id}
                      label={flag.name}
                      onDelete={() => toggleFlag(flag)}
                      sx={{
                        bgcolor: flag.color,
                        color: "white",
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No hay banderas seleccionadas
                  </Typography>
                )}
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 2, mb: 1 }}
              >
                Disponibles ({Math.min(filteredFlags.length - 2, 5)})
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {filteredFlags.slice(2, 7).map((flag) => (
                  <Chip
                    key={flag.id}
                    label={flag.name}
                    onClick={() => toggleFlag(flag)}
                    size="small"
                    sx={{
                      bgcolor: flag.color,
                      color: "white",
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.8,
                      },
                    }}
                  />
                ))}
                {filteredFlags.length > 7 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: "100%", textAlign: "center", mt: 1 }}
                  >
                    +{filteredFlags.length - 7} más disponibles
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Botones de acción */}
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}
          >
            <IconButton
              onClick={handleClose}
              sx={{
                bgcolor: "#ef4444",
                color: "white",
                width: 48,
                height: 48,
                "&:hover": {
                  bgcolor: "#dc2626",
                },
              }}
            >
              <CancelIcon />
            </IconButton>
            <IconButton
              onClick={handleSave}
              disabled={!fieldName}
              sx={{
                bgcolor: "#10b981",
                color: "white",
                width: 48,
                height: 48,
                "&:hover": {
                  bgcolor: "#059669",
                },
                "&:disabled": {
                  bgcolor: "#d1d5db",
                  color: "white",
                },
              }}
            >
              <CheckCircleIcon />
            </IconButton>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
}
