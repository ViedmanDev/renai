"use client"

/**
 * COMPONENTE: DetailTypeSelector
 * PROPÓSITO: Selector de tipos de detalles con drag and drop para reordenar
 *
 * FUNCIONALIDADES:
 * - Mostrar todos los tipos de detalles disponibles
 * - Permitir seleccionar/deseleccionar detalles con checkbox
 * - Mostrar sección de detalles seleccionados con drag and drop
 * - Abrir modal de sub-opciones para detalles que lo requieren
 *
 * PROPS:
 * - selectedDetails: Array de detalles seleccionados
 * - onDetailToggle: Callback para agregar/quitar detalle
 * - onOpenSubOptions: Callback para abrir modal de sub-opciones
 * - onReorderDetails: Callback para reordenar detalles seleccionados
 */

import { useState } from "react"
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  Divider,
  Paper,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import DeleteIcon from "@mui/icons-material/Delete"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { DETAIL_TYPES } from "@/constants/detailTypes"

export default function DetailTypeSelector({ selectedDetails, onDetailToggle, onOpenSubOptions, onReorderDetails }) {
  const [selectedType, setSelectedType] = useState("")

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value)
  }

  const handleDetailClick = (detailType) => {
    if (detailType.hasSubOptions) {
      onOpenSubOptions(detailType)
    } else {
      onDetailToggle(detailType)
    }
  }

  const isDetailSelected = (detailId) => {
    return selectedDetails.some((d) => d.id === detailId)
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return
    onReorderDetails(result.source.index, result.destination.index)
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", mt: 4 }}>
      <FormControl fullWidth>
        <Select
          value={selectedType}
          onChange={handleTypeChange}
          displayEmpty
          renderValue={(value) => {
            if (!value) {
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box component="span">🏷️</Box>
                  <Typography>Selecciona el tipo de detalle</Typography>
                </Box>
              )
            }
            const type = Object.values(DETAIL_TYPES).find((t) => t.id === value)
            return type ? type.name : value
          }}
          IconComponent={ExpandMoreIcon}
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#e0e0e0",
            },
          }}
        >
          <MenuItem value="" disabled>
            Selecciona el tipo de detalle
          </MenuItem>
          {Object.values(DETAIL_TYPES).map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.icon} {type.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box
        sx={{
          mt: 3,
          bgcolor: "white",
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          maxHeight: 400,
          overflowY: "auto",
        }}
      >
        {Object.values(DETAIL_TYPES).map((detailType, index) => (
          <Box key={detailType.id}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                "&:hover": {
                  bgcolor: "#f5f5f5",
                },
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isDetailSelected(detailType.id)}
                    onChange={() => handleDetailClick(detailType)}
                    sx={{
                      color: "#7c4dff",
                      "&.Mui-checked": {
                        color: "#7c4dff",
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2">
                    {detailType.icon} {detailType.name}
                  </Typography>
                }
              />
              {detailType.hasSubOptions && (
                <IconButton
                  size="small"
                  onClick={() => onOpenSubOptions(detailType)}
                  sx={{
                    bgcolor: "#7c4dff",
                    color: "white",
                    width: 24,
                    height: 24,
                    "&:hover": {
                      bgcolor: "#6a3de8",
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
            {index < Object.values(DETAIL_TYPES).length - 1 && <Divider />}
          </Box>
        ))}
      </Box>

      {selectedDetails.length > 0 && (
        <Paper sx={{ mt: 4, p: 2, bgcolor: "#f9fafb", borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Detalles seleccionados ({selectedDetails.length})
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
            Arrastra para cambiar el orden de prioridad
          </Typography>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="selected-details-list">
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    bgcolor: snapshot.isDraggingOver ? "#e8eaf6" : "white",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    minHeight: 100,
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {selectedDetails.map((detail, index) => (
                    <Draggable key={detail.id + index} draggableId={detail.id + index} index={index}>
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            bgcolor: snapshot.isDragging ? "#e8eaf6" : "transparent",
                            transition: "background-color 0.2s ease",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              px: 2,
                              py: 1.5,
                              "&:hover": {
                                bgcolor: snapshot.isDragging ? "#e8eaf6" : "#f5f5f5",
                              },
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: "flex",
                                  cursor: "grab",
                                  "&:active": {
                                    cursor: "grabbing",
                                  },
                                }}
                              >
                                <DragIndicatorIcon sx={{ color: "#9e9e9e", fontSize: 20 }} />
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {detail.icon} {detail.name}
                              </Typography>
                              {detail.selectedSubOption && (
                                <Typography variant="caption" color="text.secondary">
                                  ({detail.subOptions?.find((opt) => opt.id === detail.selectedSubOption)?.name})
                                </Typography>
                              )}
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => onDetailToggle(detail)}
                              sx={{
                                color: "#ef4444",
                                "&:hover": {
                                  bgcolor: "#fee2e2",
                                },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                          {index < selectedDetails.length - 1 && <Divider />}
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>
      )}
    </Box>
  )
}
