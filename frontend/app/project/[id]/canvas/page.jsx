"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  CircularProgress,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AppsIcon from "@mui/icons-material/Apps";
import TaskIcon from "@mui/icons-material/Task";
import SellIcon from "@mui/icons-material/Sell";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import FlagIcon from "@mui/icons-material/Flag";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import LockIcon from "@mui/icons-material/Lock";
import GroupIcon from "@mui/icons-material/Group";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useProjects } from "@/contexts/ProjectContext";
import DetailFieldsSidebar from "@/components/DetailFieldsSidebar";
import DetailConfigModal from "@/components/DetailConfigModal";
import AdminDrawer from "@/components/AdminDrawer";
import TaskManager from "@/components/TaskManager";
import ProjectPrivacySettings from "@/components/ProjectPrivacySettings";
import ProjectCollaborators from "@/components/ProjectCollaborators";
import ProjectPrivacyBadge from "@/components/ProjectPrivacyBadge";
import { useAuth } from "@/contexts/AuthContext";
import TagManager from "@/components/TagManager";
import CloseIcon from "@mui/icons-material/Close";

export default function ProjectCanvasPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const {
    currentProject,
    setCurrentProject,
    selectedDetails,
    reorderDetails,
    updateProject,
    deleteProject,
  } = useProjects();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [configuredDetails, setConfiguredDetails] = useState([]);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [projectName, setProjectName] = useState(currentProject?.name || "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [projectDescription, setProjectDescription] = useState(
    currentProject?.description || ""
  );
  const [openAdminDrawer, setOpenAdminDrawer] = useState(false);
  const [openTaskManager, setOpenTaskManager] = useState(false);
  const [openTagManager, setOpenTagManager] = useState(false);
  const [flagSearch, setFlagSearch] = useState("");
  
  // Estados para privacidad y colaboradores
  const [openPrivacySettings, setOpenPrivacySettings] = useState(false);
  const [openCollaborators, setOpenCollaborators] = useState(false);
  // Cargar proyecto desde backend
  useEffect(() => {
    const loadProject = async () => {
      const token = localStorage.getItem("token");
      if (!token || !params.id) {
        console.warn('⚠️ No hay token o ID de proyecto');
        return;
      }

      try {
        console.log('📦 Intentando cargar proyecto:', params.id);
        const res = await fetch(`${API_URL}/projects/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const project = await res.json();
          console.log('Proyecto cargado desde backend:', project);
          setCurrentProject(project);
        } else {
          console.error('❌ Error cargando proyecto, status:', res.status);
          // NO redirigir, permitir que funcione con datos locales
        }
      } catch (error) {
        console.error('❌ Error de red:', error);
        //NO redirigir, permitir que funcione offline
      }
    };

    // Solo cargar si currentProject está null o es diferente
    if (!currentProject || (currentProject._id !== params.id && currentProject.id !== params.id)) {
      loadProject();
    }
  }, [params.id, API_URL]);

  //Debug logs
  useEffect(() => {
    console.log('🔄 currentProject cambió:', currentProject);
    console.log('👁️ Visibilidad actual:', currentProject?.visibility);
  }, [currentProject]);

  useEffect(() => {
    console.log('👤 Usuario:', user);
  }, [user]);

  useEffect(() => {
    if (currentProject) {
      setProjectName(currentProject.name);
      setProjectDescription(currentProject.description || "");
    }
  }, [currentProject]);

  const handleDetailClick = (detail) => {
    setSelectedDetail(detail);
    setOpenConfigModal(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleSaveDetail = (configuredDetail) => {
    const exists = configuredDetails.find((d) => d.id === configuredDetail.id);
    if (exists) {
      setConfiguredDetails(
        configuredDetails.map((d) =>
          d.id === configuredDetail.id ? configuredDetail : d
        )
      );
    } else {
      setConfiguredDetails([...configuredDetails, configuredDetail]);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(selectedDetails);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderDetails(items.indexOf(reorderedItem), result.destination.index);
  };

  const handleReorderDetailsFromSidebar = (sourceIndex, destinationIndex) => {
    reorderDetails(sourceIndex, destinationIndex);
  };

  const getDetailValue = (detail) => {
    const configured = configuredDetails.find((d) => d.id === detail.id);
    return configured?.fieldName || "Sin configurar";
  };

  const getDetailFlags = (detail) => {
    const configured = configuredDetails.find((d) => d.id === detail.id);
    return configured?.flags || [];
  };

  /**
   * Formatea el valor según el tipo de detalle y decimales configurados
   */
  const formatValue = (detail) => {
    const configured = configuredDetails.find((d) => d.id === detail.id);

    if (detail.id === "ruta_critica") {
      return (
        configured?.criticalPath || detail.criticalPath || "Sin descripción"
      );
    }

    if (detail.id === "producto") {
      return (
        configured?.productName ||
        detail.productName ||
        "Sin nombre de producto"
      );
    }

    if (detail.id === "indicador_producto") {
      return (
        configured?.productIndicator ||
        detail.productIndicator ||
        "Sin indicador"
      );
    }

    if (detail.id === "fecha") {
      const dateType = configured?.dateType || detail.dateType;
      const date = configured?.date || detail.date;
      const startDate = configured?.startDate || detail.startDate;
      const endDate = configured?.endDate || detail.endDate;

      if (dateType === "single" && date) {
        return new Date(date).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
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
        })}`;
      }
      return "Sin fecha configurada";
    }

    if (detail.id === "numerico") {
      const value = configured?.value || detail.value;
      if (value) {
        const decimals = configured?.decimals || detail.decimals || 2;
        const numValue = Number.parseFloat(value);
        const subOption =
          configured?.selectedSubOption || detail.selectedSubOption;
        const option = detail.subOptions?.find((opt) => opt.id === subOption);
        const symbol = option?.symbol || "";
        return `${symbol}${numValue.toFixed(decimals)}`;
      }
      return "Sin valor";
    }

    if (detail.id === "valor_cotizacion" || detail.id === "valor_venta") {
      const value = configured?.value || detail.value;
      if (value) {
        const decimals = configured?.decimals || detail.decimals || 2;
        const numValue = Number.parseFloat(value);
        return `$${numValue.toLocaleString("es-ES", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}`;
      }
      return "Sin valor";
    }

    if (detail.id === "texto" || detail.id === "campo") {
      const textValue = configured?.textValue || detail.textValue;
      return textValue || "Sin texto";
    }

    if (detail.id === "si_no") {
      const boolValue =
        configured?.booleanValue !== undefined
          ? configured.booleanValue
          : detail.booleanValue;
      return boolValue ? "Sí" : "No";
    }

    if (detail.id === "ponderacion") {
      const value = configured?.value || detail.value;
      return value ? `${value}%` : "Sin porcentaje";
    }

    if (detail.id === "nota_interna") {
      const note = configured?.internalNote || detail.internalNote;
      return note || "Sin nota";
    }

    if (detail.id === "adjuntos") {
      const attachments = configured?.attachments || detail.attachments;
      return attachments && attachments.length > 0
        ? `${attachments.length} archivo(s)`
        : "Sin archivos";
    }

    if (detail.id === "desde_listas") {
      const selectedList = configured?.selectedList || detail.selectedList;
      return selectedList || "Sin selección";
    }

    return configured?.fieldName || detail.fieldName || "Sin configurar";
  };

  const handleSaveProjectName = () => {
    if (projectName.trim() && currentProject) {
      const projectId = currentProject._id || currentProject.id;
      updateProject(projectId, { name: projectName.trim() });
      setIsEditingProjectName(false);
    }
  };

  const handleCancelEditProjectName = () => {
    setProjectName(currentProject?.name || "");
    setIsEditingProjectName(false);
  };

  const handleSaveProjectDescription = () => {
    if (currentProject) {
      const projectId = currentProject._id || currentProject.id;
      updateProject(projectId, {
        description: projectDescription.trim(),
      });
      setIsEditingDescription(false);
    }
  }

  const handleCancelEditProjectDescription = () => {
    setProjectDescription(currentProject?.description || "");
    setIsEditingDescription(false);
  };

  const handleDeleteProject = async () => {
    if (!confirm("¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.")) {
      return;
    }

    const projectId = currentProject?._id || currentProject?.id;

    if (!projectId || projectId === 'undefined') {
      console.error('❌ ID inválido para eliminar:', projectId);
      alert('Error: No se pudo identificar el proyecto');
      return;
    }

    console.log('🗑️ Eliminando proyecto:', projectId);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        console.log('✅ Proyecto eliminado correctamente');
        deleteProject(projectId); // Actualizar contexto
        router.push("/");
      } else {
        const data = await res.json();
        alert('Error al eliminar: ' + (data.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ Error eliminando proyecto:', error);
      alert('Error de conexión al eliminar el proyecto');
    }
  };

  const getFilteredDetails = () => {
    if (!flagSearch.trim()) {
      return selectedDetails;
    }

    const searchLower = flagSearch.toLowerCase().trim();

    return selectedDetails.filter((detail) => {
      const flags = getDetailFlags(detail);
      return flags.some((flag) =>
        flag.name.toLowerCase().includes(searchLower)
      );
    });
  };

  const filteredDetails = getFilteredDetails();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fafafa",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
          <IconButton
            onClick={() => router.push(`/project/${params.id}/details`)}
            size="small"
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setOpenAdminDrawer(true)}
            title="Panel administrativo"
          >
            <AppsIcon />
          </IconButton>
          <IconButton
            onClick={() => router.push("/")}
            title="Volver al inicio"
            size="small"
          >
            <HomeIcon />
          </IconButton>

          {/* Botones de privacidad y colaboradores */}
          <IconButton
            onClick={() => setOpenPrivacySettings(true)}
            title="Configuración de privacidad"
            size="small"
            sx={{ 
              bgcolor: '#f5f5f5',
              '&:hover': { bgcolor: '#e0e0e0' }
            }}
          >
            <LockIcon fontSize="small" />
          </IconButton>
          
          <IconButton
            onClick={() => setOpenCollaborators(true)}
            title="Gestionar colaboradores"
            size="small"
            sx={{ 
              bgcolor: '#f5f5f5',
              '&:hover': { bgcolor: '#e0e0e0' }
            }}
          >
            <GroupIcon fontSize="small" />
          </IconButton>

          <Box sx={{ flexGrow: 1, minWidth: { xs: "100%", sm: "auto" } }} />
          
          {/* NUEVO: Badge de privacidad */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <ProjectPrivacyBadge
              key={`badge-${currentProject?.visibility}-${currentProject?._id}`}
              visibility={currentProject?.visibility || 'private'}
              size="small"
            />
          </Box>

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
          <IconButton onClick={() => router.push("/profile")} sx={{ p: 0 }}>
            <Avatar
              key={user?._id || user?.email || 'no-user'}
              sx={{
                bgcolor: "#5e35b1",
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
              }}
              src={user?.picture}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
          </IconButton>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          flexGrow: 1,
        }}
      >
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
                          handleSaveProjectName();
                        }
                      }}
                      sx={{ minWidth: { xs: 200, sm: 300 } }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleSaveProjectName}
                      color="primary"
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleCancelEditProjectName}
                      color="error"
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography
                      variant="h6"
                      sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                    >
                      {currentProject?.name || "Proyecto demo"}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setIsEditingProjectName(true)}
                      title="Editar nombre del proyecto"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleDeleteProject}
                      title="Eliminar proyecto"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
                <IconButton
                  size="small"
                  onClick={() => setOpenTaskManager(true)}
                  title="Gestionar tareas"
                >
                  <TaskIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setOpenTagManager(true)}
                  title="Gestionar etiquetas"
                >
                  <SellIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Project Description */}
              <Box sx={{ mb: { xs: 2, sm: 3 }, textAlign: "center" }}>
                {isEditingDescription ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <TextField
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      size="small"
                      multiline
                      rows={2}
                      placeholder="Descripción del proyecto"
                      sx={{ minWidth: { xs: 250, sm: 400 } }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleSaveProjectDescription}
                      color="primary"
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleCancelEditProjectDescription}
                      color="error"
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {currentProject?.description || "Sin descripción"}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setIsEditingDescription(true)}
                      title="Editar descripción"
                    >
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
                {/* <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    if (selectedDetails.length > 0) {
                      setSelectedDetail(selectedDetails[0]);
                      setOpenConfigModal(true);
                    }
                  }}
                  sx={{
                    textTransform: "none",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1.5, sm: 2 },
                  }}
                >
                  Editar detalles
                </Button> */}
              </Box>

              {/* Details Display */}
              {selectedDetails.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 2, sm: 3 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      bgcolor: "#f9fafb",
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <SearchIcon sx={{ color: "#6b7280" }} />
                    <TextField
                      fullWidth
                      variant="standard"
                      placeholder="Buscar por banderas..."
                      value={flagSearch}
                      onChange={(e) => setFlagSearch(e.target.value)}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          fontSize: "0.95rem",
                          "& input::placeholder": {
                            color: "#9ca3af",
                            opacity: 1,
                          },
                        },
                      }}
                    />
                    {flagSearch && (
                      <IconButton
                        size="small"
                        onClick={() => setFlagSearch("")}
                        sx={{
                          bgcolor: "#f3f4f6",
                          "&:hover": { bgcolor: "#e5e7eb" },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {filteredDetails.length === 0 ? (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 6,
                        px: 3,
                        bgcolor: "#f9fafb",
                        borderRadius: 2,
                        border: "2px dashed #e5e7eb",
                      }}
                    >
                      <SearchIcon
                        sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        No se encontraron detalles
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No hay detalles con banderas que coincidan con "
                        {flagSearch}"
                      </Typography>
                    </Box>
                  ) : (
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
                              bgcolor: snapshot.isDraggingOver
                                ? "#f0f0f0"
                                : "transparent",
                              borderRadius: 2,
                              transition: "background-color 0.2s ease",
                            }}
                          >
                            {filteredDetails.map((detail, index) => {
                              const flags = getDetailFlags(detail);
                              const realIndex = selectedDetails.findIndex(
                                (d) => d.id === detail.id
                              );
                              return (
                                <Draggable
                                  key={detail.id + realIndex}
                                  draggableId={detail.id + realIndex}
                                  index={realIndex}
                                >
                                  {(provided, snapshot) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        p: { xs: 1.5, sm: 2 },
                                        bgcolor: snapshot.isDragging
                                          ? "#e8eaf6"
                                          : "#f9fafb",
                                        borderRadius: 2,
                                        cursor: "pointer",
                                        boxShadow: snapshot.isDragging
                                          ? "0 5px 15px rgba(0,0,0,0.2)"
                                          : "none",
                                        transform: snapshot.isDragging
                                          ? "rotate(2deg)"
                                          : "none",
                                        transition:
                                          "background-color 0.2s ease",
                                        flexWrap: { xs: "wrap", sm: "nowrap" },
                                        gap: { xs: 1, sm: 0 },
                                        "&:hover": {
                                          bgcolor: snapshot.isDragging
                                            ? "#e8eaf6"
                                            : "#f3f4f6",
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
                                            sx={{
                                              color: "#9e9e9e",
                                              fontSize: {
                                                xs: "1.25rem",
                                                sm: "1.5rem",
                                              },
                                            }}
                                          />
                                        </Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            minWidth: { xs: 100, sm: 150 },
                                            fontSize: {
                                              xs: "0.75rem",
                                              sm: "0.875rem",
                                            },
                                          }}
                                        >
                                          {detail.icon} {detail.name}
                                        </Typography>
                                        <Typography
                                          variant="body1"
                                          sx={{
                                            fontSize: {
                                              xs: "0.875rem",
                                              sm: "1rem",
                                            },
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
                                                fontSize: {
                                                  xs: "0.65rem",
                                                  sm: "0.75rem",
                                                },
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
                              );
                            })}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: { xs: 4, sm: 6, md: 8 } }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    No hay detalles seleccionados. Haz clic en "Agregar
                    detalles" para comenzar.
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
      <AdminDrawer
        open={openAdminDrawer}
        onClose={() => setOpenAdminDrawer(false)}
      />

      {/* Task Manager Dialog */}
      <Dialog
        open={openTaskManager}
        onClose={() => setOpenTaskManager(false)}
        maxWidth="md"
        fullWidth
      >
        {/* <DialogTitle>Tareas del Proyecto</DialogTitle> */}
        <DialogContent>
          <TaskManager projectId={currentProject?.id} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskManager(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modales de privacidad y colaboradores */}
      <ProjectPrivacySettings
        open={openPrivacySettings}
        onClose={() => {
          setOpenPrivacySettings(false);
        }}
        project={currentProject}
        onUpdate={(updatedProject) => {
          console.log("🔄 Visibilidad cambiada a:", updatedProject.visibility);

          const projectId = currentProject._id || currentProject.id;

          setCurrentProject({
            ...currentProject,
            visibility: updatedProject.visibility
          });
          updateProject(projectId, { visibility: updatedProject.visibility });
        }}
      />

      <ProjectCollaborators
        open={openCollaborators}
        onClose={() => setOpenCollaborators(false)}
        project={currentProject}
      />
    </Box>
  );
}