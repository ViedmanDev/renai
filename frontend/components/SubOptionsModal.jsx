"use client"

/**
 * COMPONENTE: SubOptionsModal
 * PROPÓSITO: Modal para seleccionar sub-opciones de tipos de detalles
 *
 * PROPS:
 * - open (boolean): Controla visibilidad del modal
 * - onClose (function): Callback al cerrar
 * - detailType (object): Tipo de detalle con sus sub-opciones
 * - onConfirm (function): Callback al confirmar selección
 *
 * ESTADO:
 * - selectedOption: Sub-opción seleccionada
 * - value: Valor numérico (solo para tipos numéricos)
 * - startDate: Fecha de inicio (para rangos de fecha)
 * - endDate: Fecha de fin (para rangos de fecha)
 * - decimals: Cantidad de decimales (para numéricos)
 *
 * CONEXIÓN A BD:
 * Los valores configurados aquí se guardan en: project_details
 * Campos: detail_type_id, sub_option_id, value, start_date, end_date, decimals
 */

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  ToggleButton,
  TextField,
  InputAdornment,
} from "@mui/material"
import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"

export default function SubOptionsModal({ open, onClose, detailType, onConfirm }) {
  // Estado para la sub-opción seleccionada
  const [selectedOption, setSelectedOption] = useState("")
  // Estado para el valor numérico
  const [value, setValue] = useState("")
  // Estados para fechas
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  // Estado para decimales en numéricos
  const [decimals, setDecimals] = useState(2)

  // Resetear estado cuando cambia el tipo de detalle
  useEffect(() => {
    if (open) {
      setSelectedOption("")
      setValue("")
      setStartDate("")
      setEndDate("")
      setDecimals(2)
    }
  }, [open, detailType])

  if (!detailType) return null

  /**
   * Confirma la selección y envía todos los datos configurados
   */
  const handleConfirm = () => {
    if (selectedOption) {
      const configuredDetail = {
        ...detailType,
        selectedSubOption: selectedOption,
        decimals: decimals,
      }

      if (detailType.id === "fecha") {
        if (selectedOption === "fecha_unica") {
          configuredDetail.dateType = "single"
          configuredDetail.date = startDate
        } else if (selectedOption === "rango_fechas") {
          configuredDetail.dateType = "range"
          configuredDetail.startDate = startDate
          configuredDetail.endDate = endDate
        }
      }

      if (detailType.id === "numerico") {
        configuredDetail.value = value
      }

      onConfirm(configuredDetail)
      handleCancel()
    }
  }

  const handleCancel = () => {
    setSelectedOption("")
    setValue("")
    setStartDate("")
    setEndDate("")
    setDecimals(2)
    onClose()
  }

  /**
   * Renderiza campos adicionales según el tipo de detalle
   */
  const renderAdditionalFields = () => {
    if (detailType.id === "numerico" && selectedOption) {
      const option = detailType.subOptions.find((opt) => opt.id === selectedOption)
      return (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            Valor numérico
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ingresa el valor"
            InputProps={{
              startAdornment: option?.symbol && <InputAdornment position="start">{option.symbol}</InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" gutterBottom>
            Cantidad de decimales
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={decimals}
            onChange={(e) => setDecimals(Number.parseInt(e.target.value) || 0)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <IconButton size="small" onClick={() => setDecimals((d) => d + 1)} sx={{ p: 0 }}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDecimals((d) => Math.max(0, d - 1))} sx={{ p: 0 }}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )
    }

    if (detailType.id === "fecha" && selectedOption) {
      if (selectedOption === "fecha_unica") {
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              Selecciona la fecha
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        )
      } else if (selectedOption === "rango_fechas") {
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              Fecha de inicio
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <Typography variant="body2" gutterBottom>
              Fecha de fin
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        )
      }
    }

    return null
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 3,
        },
      }}
    >
      <DialogContent>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Selecciona el tipo de {detailType?.name}
          </Typography>

          {detailType?.subOptions && (
            <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
              {detailType.subOptions.map((option) => (
                <ToggleButton
                  key={option.id}
                  value={option.id}
                  selected={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: "none",
                    "&.Mui-selected": {
                      bgcolor: "#f3f0ff",
                      borderColor: "#7c4dff",
                      "&:hover": {
                        bgcolor: "#e9e3ff",
                      },
                    },
                  }}
                >
                  {option.name}
                </ToggleButton>
              ))}
            </Box>
          )}

          {renderAdditionalFields()}

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}>
            <IconButton
              onClick={handleCancel}
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
              onClick={handleConfirm}
              disabled={!selectedOption}
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
        </Box>
      </DialogContent>
    </Dialog>
  )
}
