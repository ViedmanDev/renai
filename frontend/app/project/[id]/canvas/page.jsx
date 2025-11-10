"use client"

/**
 * COMPONENTE: ProjectCanvasPage
 * PROPÓSITO: Vista final del proyecto mostrando todos los detalles configurados
 *
 * FUNCIONALIDADES:
 * - Visualización de detalles con valores formateados
 * - Drag and drop para reordenar detalles
 * - Edición de detalles mediante modal
 * - Navegación de regreso al inicio
 *
 * CONEXIÓN A BD:
 * Lee de: projects, project_details, project_detail_configs
 * Actualiza: project_details (orden), project_detail_configs (configuración)
 */

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Box,
  Container,
  Typography,
  IconButton,
  Avatar,
  Button,
  Chip,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import AppsIcon from "@mui/icons-material/Apps"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import FlagIcon from "@mui/icons-material/Flag"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import DeleteIcon from "@mui/icons-material/Delete"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useProjects } from "@/contexts/ProjectContext"
import DetailFieldsSidebar from "@/components/DetailFieldsSidebar"
import DetailConfigModal from "@/components/DetailConfigModal"
import AdminDrawer from "@/components/AdminDrawer"
import TaskManager from "@/components/TaskManager"
import HomeIcon from "@mui/icons-material/Home"

export default function ProjectCanvasPage() {
  const router = useRouter()
  const params = useParams()
  const { currentProject, selectedDetails, reorderDetails, updateProject, deleteProject } = useProjects()
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [openConfigModal, setOpenConfigModal] = useState(false)
  const [configuredDetails, setConfiguredDetails] = useState([])
  const [isEditingProjectName, setIsEditingProjectName] = useState(false)
  const [projectName, setProjectName] = useState(currentProject?.name || "")
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [projectDescription, setProjectDescription] = useState(currentProject?.description || "")
  const [openAdminDrawer, setOpenAdminDrawer] = useState(false)
  const [openTaskManager, setOpenTaskManager] = useState(false)

  useEffect(() => {
    if (currentProject) {
      setProjectName(currentProject.name)
      setProjectDescription(currentProject.description || "")
    }
  }, [currentProject])

  const handleDetailClick = (detail) => {
    setSelectedDetail(detail)
    setOpenConfigModal(true)
  }

  const handleSaveDetail = (configuredDetail) => {
    const exists = configuredDetails.find((d) => d.id === configuredDetail.id)
    if (exists) {
      setConfiguredDetails(configuredDetails.map((d) => (d.id === configuredDetail.id ? configuredDetail : d)))
    } else {
      setConfiguredDetails([...configuredDetails, configuredDetail])
    }
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(selectedDetails)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    reorderDetails(items.indexOf(reorderedItem), result.destination.index)
  }

  const handleReorderDetailsFromSidebar = (sourceIndex, destinationIndex) => {
    reorderDetails(sourceIndex, destinationIndex)
  }

  const getDetailValue = (detail) => {
    const configured = configuredDetails.find((d) => d.id === detail.id)
    return configured?.fieldName || "Sin configurar"
  }

  const getDetailFlags = (detail) => {
    const configured = configuredDetails.find((d) => d.id === detail.id)
    return configured?.flags || []
  }

  /**
   * Formatea el valor según el tipo de detalle y decimales configurados
   */
  const formatValue = (detail) => {
    const configured = configuredDetails.find((d) => d.id === detail.id)

    if (detail.id === "ruta_critica") {
      return configured?.criticalPath || detail.criticalPath || "Sin descripción"
    }

    if (detail.id === "producto") {
      return configured?.productName || detail.productName || "Sin nombre de producto"
    }

    if (detail.id === "indicador_producto") {
      return configured?.productIndicator || detail.productIndicator || "Sin indicador"
    }

    if (detail.id === "fecha") {
      const dateType = configured?.dateType || detail.dateType
      const date = configured?.date || detail.date
      const startDate = configured?.startDate || detail.startDate
      const endDate = configured?.endDate || detail.endDate

      if (dateType === "single" && date) {
        return new Date(date).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
      if (dateType === "range" && startDate && endDate) {
        return `${new Date(startDate).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })} - ${new Date(endDate).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}`
      }
      return "Sin fecha configurada"
    }

    if (detail.id === "numerico") {
      const value = configured?.value || detail.value
      if (value) {
        const decimals = configured?.decimals || detail.decimals || 2
        const numValue = Number.parseFloat(value)
        const subOption = configured?.selectedSubOption || detail.selectedSubOption
        const option = detail.subOptions?.find((opt) => opt.id === subOption)
        const symbol = option?.symbol || ""
        return `${symbol}${numValue.toFixed(decimals)}`
      }
      return "Sin valor"
    }

    if (detail.id === "valor_cotizacion" || detail.id === "valor_venta") {
      const value = configured?.value || detail.value
      if (value) {
        const decimals = configured?.decimals || detail.decimals || 2
        const numValue = Number.parseFloat(value)
        return `$${numValue.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
      }
      return "Sin valor"
    }

    if (detail.id === "texto" || detail.id === "campo") {
      const textValue = configured?.textValue || detail.textValue
      return textValue || "Sin texto"
    }

    if (detail.id === "si_no") {
      const boolValue = configured?.booleanValue !== undefined ? configured.booleanValue : detail.booleanValue
      return boolValue ? "Sí" : "No"
    }

    if (detail.id === "ponderacion") {
      const value = configured?.value || detail.value
      return value ? `${value}%` : "Sin porcentaje"
    }

    if (detail.id === "nota_interna") {
      const note = configured?.internalNote || detail.internalNote
      return note || "Sin nota"
    }

    if (detail.id === "adjuntos") {
      const attachments = configured?.attachments || detail.attachments
      return attachments && attachments.length > 0 ? `${attachments.length} archivo(s)` : "Sin archivos"
    }

    if (detail.id === "desde_listas") {
      const selectedList = configured?.selectedList || detail.selectedList
      return selectedList || "Sin selección"
    }

    return configured?.fieldName || detail.fieldName || "Sin configurar"
  }

  const handleSaveProjectName = () => {
    if (projectName.trim() && currentProject) {
      updateProject(currentProject.id, { name: projectName.trim() })
      setIsEditingProjectName(false)
    }
  }

  const handleCancelEditProjectName = () => {
    setProjectName(currentProject?.name || "")
    setIsEditingProjectName(false)
  }

  const handleSaveProjectDescription = () => {
    if (currentProject) {
      updateProject(currentProject.id, { description: projectDescription.trim() })
      setIsEditingDescription(false)
    }
  }

  const handleCancelEditProjectDescription = () => {
    setProjectDescription(currentProject?.description || "")
    setIsEditingDescription(false)
  }

  const handleDeleteProject = () => {
    if (confirm("¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.")) {
      deleteProject(currentProject.id)
      router.push("/")
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e0e0e0",
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <IconButton onClick={() => router.push(`/project/${params.id}/details`)} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton size="small" onClick={() => setOpenAdminDrawer(true)} title="Panel administrativo">
            <AppsIcon />
          </IconButton>
          <IconButton onClick={() => router.push("/")} title="Volver al inicio" size="small">
            <HomeIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, minWidth: { xs: "100%", sm: "auto" } }} />
          <Typography
            variant="body1"
            sx={{
              display: { xs: "none", sm: "block" },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {currentProject?.name || "Proyecto 1 Ejemplo Ejemplo"}
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#2c2c2c",
              textTransform: "none",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              px: { xs: 1.5, sm: 2 },
              "&:hover": {
                bgcolor: "#1a1a1a",
              },
            }}
          >
            Exportar como
          </Button>
          <Avatar sx={{ bgcolor: "#5e35b1", width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>J</Avatar>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, flexGrow: 1 }}>
        <DetailFieldsSidebar
          details={selectedDetails}
          onDetailClick={handleDetailClick}
          selectedDetailId={selectedDetail?.id}
          onReorderDetails={handleReorderDetailsFromSidebar}
        />

        {/* Canvas Area */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Container maxWidth="lg">
            <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3 }}>
              {/* Project Title */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: { xs: 1, sm: 2 },
                  mb: { xs: 2, sm: 3, md: 4 },
                  flexWrap: "wrap",
                }}
              >
                {isEditingProjectName ? (
                  <>
                    <TextField
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      size="small"
                      autoFocus
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSaveProjectName()
                        }
                      }}
                      sx={{ minWidth: { xs: 200, sm: 300 } }}
                    />
                    <IconButton size="small" onClick={handleSaveProjectName} color="primary">
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleCancelEditProjectName} color="error">
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                      {currentProject?.name || "Proyecto demo"}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setIsEditingProjectName(true)}
                      title="Editar nombre del proyecto"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleDeleteProject} title="Eliminar proyecto" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
                <IconButton size="small" onClick={() => setOpenTaskManager(true)} title="Gestionar tareas">
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Project Description */}
              <Box sx={{ mb: { xs: 2, sm: 3 }, textAlign: "center" }}>
                {isEditingDescription ? (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <TextField
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Descripción del proyecto"
                      sx={{ minWidth: { xs: 250, sm: 400 } }}
                    />
                    <IconButton size="small" onClick={handleSaveProjectDescription} color="primary">
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleCancelEditProjectDescription} color="error">
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {currentProject?.description || "Sin descripción"}
                    </Typography>
                    <IconButton size="small" onClick={() => setIsEditingDescription(true)} title="Editar descripción">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: { xs: 1, sm: 2 },
                  mb: { xs: 2, sm: 3, md: 4 },
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => router.push(`/project/${params.id}/details`)}
                  sx={{
                    textTransform: "none",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1.5, sm: 2 },
                  }}
                >
                  Agregar detalles
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    if (selectedDetails.length > 0) {
                      setSelectedDetail(selectedDetails[0])
                      setOpenConfigModal(true)
                    }
                  }}
                  sx={{
                    textTransform: "none",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1.5, sm: 2 },
                  }}
                >
                  Editar detalles
                </Button>
              </Box>

              {/* Details Display */}
              {selectedDetails.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="details">
                      {(provided, snapshot) => (
                        <Box
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: { xs: 1.5, sm: 2 },
                            bgcolor: snapshot.isDraggingOver ? "#f0f0f0" : "transparent",
                            borderRadius: 2,
                            transition: "background-color 0.2s ease",
                          }}
                        >
                          {selectedDetails.map((detail, index) => {
                            const flags = getDetailFlags(detail)
                            return (
                              <Draggable key={detail.id + index} draggableId={detail.id + index} index={index}>
                                {(provided, snapshot) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      p: { xs: 1.5, sm: 2 },
                                      bgcolor: snapshot.isDragging ? "#e8eaf6" : "#f9fafb",
                                      borderRadius: 2,
                                      cursor: "pointer",
                                      boxShadow: snapshot.isDragging ? "0 5px 15px rgba(0,0,0,0.2)" : "none",
                                      transform: snapshot.isDragging ? "rotate(2deg)" : "none",
                                      transition: "background-color 0.2s ease",
                                      flexWrap: { xs: "wrap", sm: "nowrap" },
                                      gap: { xs: 1, sm: 0 },
                                      "&:hover": {
                                        bgcolor: snapshot.isDragging ? "#e8eaf6" : "#f3f4f6",
                                      },
                                    }}
                                    onClick={() => handleDetailClick(detail)}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: { xs: 1, sm: 2 },
                                        flexGrow: 1,
                                        minWidth: 0,
                                      }}
                                    >
                                      <Box
                                        {...provided.dragHandleProps}
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          cursor: "grab",
                                          "&:active": {
                                            cursor: "grabbing",
                                          },
                                        }}
                                      >
                                        <DragIndicatorIcon
                                          sx={{ color: "#9e9e9e", fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                                        />
                                      </Box>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          minWidth: { xs: 100, sm: 150 },
                                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                        }}
                                      >
                                        {detail.icon} {detail.name}
                                      </Typography>
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          fontSize: { xs: "0.875rem", sm: "1rem" },
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        {formatValue(detail)}
                                      </Typography>
                                    </Box>
                                    {flags.length > 0 && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          flexWrap: "wrap",
                                          width: { xs: "100%", sm: "auto" },
                                          mt: { xs: 1, sm: 0 },
                                        }}
                                      >
                                        <FlagIcon fontSize="small" />
                                        {flags.map((flag) => (
                                          <Chip
                                            key={flag.id}
                                            label={flag.name}
                                            size="small"
                                            sx={{
                                              bgcolor: flag.color,
                                              color: "white",
                                              cursor: "grab",
                                              fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                              height: { xs: 20, sm: 24 },
                                              "&:active": {
                                                cursor: "grabbing",
                                              },
                                            }}
                                          />
                                        ))}
                                      </Box>
                                    )}
                                  </Box>
                                )}
                              </Draggable>
                            )
                          })}
                          {provided.placeholder}
                        </Box>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: { xs: 4, sm: 6, md: 8 } }}>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                    No hay detalles seleccionados. Haz clic en "Agregar detalles" para comenzar.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Container>
        </Box>
      </Box>

      {/* Config Modal */}
      <DetailConfigModal
        open={openConfigModal}
        onClose={() => setOpenConfigModal(false)}
        detail={selectedDetail}
        onSave={handleSaveDetail}
      />

      {/* Admin Drawer */}
      <AdminDrawer open={openAdminDrawer} onClose={() => setOpenAdminDrawer(false)} />

      {/* Task Manager Dialog */}
      <Dialog open={openTaskManager} onClose={() => setOpenTaskManager(false)} maxWidth="md" fullWidth>
        <DialogTitle>Tareas del Proyecto</DialogTitle>
        <DialogContent>
          <TaskManager projectId={currentProject?.id} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskManager(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
