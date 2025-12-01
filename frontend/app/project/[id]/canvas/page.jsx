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
  Collapse,
  Tooltip,
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
import GroupIcon from "@mui/icons-material/Group";
import SecurityIcon from "@mui/icons-material/Security";
import GroupManager from "@/components/GroupManager";
import ProjectGroupPermissions from "@/components/ProjectGroupPermissions";
import PermissionsMatrix from "@/components/PermissionsMatrix";
import CreateElementModal from "@/components/CreateElementModal";
import CreateSubElementModal from "@/components/CreateSubElementModal";
import CreateDetailModal from "@/components/CreateDetailModal";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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

  const [openGroupManager, setOpenGroupManager] = useState(false);
  const [openProjectGroups, setOpenProjectGroups] = useState(false);
  const [openPermissionsMatrix, setOpenPermissionsMatrix] = useState(false);
  const [elements, setElements] = useState([]);
  const [expandedElements, setExpandedElements] = useState({});
  const [expandedSubElements, setExpandedSubElements] = useState({});

  const [openCreateElement, setOpenCreateElement] = useState(false);
  const [openCreateSubElement, setOpenCreateSubElement] = useState(false);
  const [openCreateDetail, setOpenCreateDetail] = useState(false);
  const [selectedElementIndex, setSelectedElementIndex] = useState(null);
  const [selectedSubElementIndex, setSelectedSubElementIndex] = useState(null);

  const [openEditElement, setOpenEditElement] = useState(false);
  const [elementToEditIndex, setElementToEditIndex] = useState(null);
  const [editElementName, setEditElementName] = useState("");
  const [editElementDescription, setEditElementDescription] = useState("");

  const [openEditSubElement, setOpenEditSubElement] = useState(false);
  const [editSubElemIndices, setEditSubElemIndices] = useState({
    elem: null,
    sub: null,
  });
  const [editSubElemName, setEditSubElemName] = useState("");
  const [editSubElemDescription, setEditSubElemDescription] = useState("");

  // Estados para privacidad y colaboradores
  const [openPrivacySettings, setOpenPrivacySettings] = useState(false);
  const [openCollaborators, setOpenCollaborators] = useState(false);
  // Cargar proyecto desde backend
  useEffect(() => {
    const loadProject = async () => {
      const token = localStorage.getItem("token");
      if (!token || !params.id) {
        console.warn("⚠️ No hay token o ID de proyecto");
        return;
      }

      try {
        console.log("📦 Intentando cargar proyecto:", params.id);
        const res = await fetch(`${API_URL}/projects/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const project = await res.json();
          console.log("Proyecto cargado desde backend:", project);
          setCurrentProject(project);
        } else {
          console.error("❌ Error cargando proyecto, status:", res.status);
          // NO redirigir, permitir que funcione con datos locales
        }
      } catch (error) {
        console.error("❌ Error de red:", error);
        //NO redirigir, permitir que funcione offline
      }
    };

    // Solo cargar si currentProject está null o es diferente
    if (
      !currentProject ||
      (currentProject._id !== params.id && currentProject.id !== params.id)
    ) {
      loadProject();
    }
  }, [params.id, API_URL]);
  if (elementToEditIndex !== null) {
    const element = elements[elementToEditIndex];
    // ...
  }

  //Debug logs
  useEffect(() => {
    console.log("🔄 currentProject cambió:", currentProject);
    console.log("👁️ Visibilidad actual:", currentProject?.visibility);
  }, [currentProject]);

  useEffect(() => {
    console.log("👤 Usuario:", user);
  }, [user]);

  useEffect(() => {
    if (currentProject) {
      setProjectName(currentProject.name);
      setProjectDescription(currentProject.description || "");
      setElements(currentProject.elements || []);
    }
  }, [currentProject]);

  const toggleElement = (index) => {
    setExpandedElements((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleSubElement = (elementIndex, subIndex) => {
    const key = `${elementIndex}-${subIndex}`;
    setExpandedSubElements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCreateElement = (element) => {
    const newElements = [
      ...elements,
      { ...element, id: Date.now(), subElements: [] },
    ];
    setElements(newElements);
    updateProject(currentProject.id, { elements: newElements });
  };

  const handleCreateSubElement = (subElement) => {
    const newElements = [...elements];
    if (!newElements[selectedElementIndex].subElements) {
      newElements[selectedElementIndex].subElements = [];
    }
    newElements[selectedElementIndex].subElements.push({
      ...subElement,
      id: Date.now(),
      details: [],
    });
    setElements(newElements);
    updateProject(currentProject.id, { elements: newElements });
  };

  const handleCreateDetail = (detail) => {
    const newElements = [...elements];
    if (
      !newElements[selectedElementIndex].subElements[selectedSubElementIndex]
        .details
    ) {
      newElements[selectedElementIndex].subElements[
        selectedSubElementIndex
      ].details = [];
    }
    newElements[selectedElementIndex].subElements[
      selectedSubElementIndex
    ].details.push({
      ...detail,
      id: Date.now(),
    });
    setElements(newElements);
    updateProject(currentProject.id, { elements: newElements });
  };

  //editar los elementos
  const handleSaveElementEdit = () => {
    if (elementToEditIndex === null || !currentProject) return;

    const projectId = currentProject._id || currentProject.id;
    const newElements = [...elements];

    newElements[elementToEditIndex] = {
      ...newElements[elementToEditIndex],
      name: editElementName.trim(),
      description: editElementDescription.trim(),
    };

    setElements(newElements);
    updateProject(projectId, { elements: newElements });

    setOpenEditElement(false);
    setElementToEditIndex(null);
  };

  // editar sub elementos
  const handleSaveSubElementEdit = () => {
    if (!editSubElemIndices || !currentProject) return;
    const projectId = currentProject._id || currentProject.id;
    const { elem, sub } = editSubElemIndices;

    const newElements = [...elements];
    newElements[elem].subElements[sub] = {
      ...newElements[elem].subElements[sub],
      name: editSubElemName.trim(),
      description: editSubElemDescription.trim(),
    };

    setElements(newElements);
    updateProject(projectId, { elements: newElements });
    setOpenEditSubElement(false);
    setEditSubElemIndices({ elem: null, sub: null });
  };

  // Eliminar ELEMENTO
  const handleDeleteElement = (elementId) => {
    const ok = window.confirm("¿Eliminar este elemento y todo su contenido?");
    if (!ok) return;

    const projectId = currentProject?._id || currentProject?.id;

    setElements((prev) => {
      const newElements = prev.filter((el) => el.id !== elementId);
      if (projectId) {
        updateProject(projectId, { elements: newElements });
      }
      return newElements;
    });
  };

  // Eliminar SUBELEMENTO
  const handleDeleteSubElement = (elementId, subElementId) => {
    const ok = window.confirm("¿Eliminar este sub elemento y sus detalles?");
    if (!ok) return;

    const projectId = currentProject?._id || currentProject?.id;

    setElements((prev) => {
      const newElements = prev.map((el) =>
        el.id === elementId
          ? {
              ...el,
              subElements: (el.subElements || []).filter(
                (sub) => sub.id !== subElementId
              ),
            }
          : el
      );

      if (projectId) {
        updateProject(projectId, { elements: newElements });
      }

      return newElements;
    });
  };

  // Eliminar DETALLE
  const handleDeleteDetail = (elementId, subElementId, detailId) => {
    const ok = window.confirm("¿Eliminar este detalle?");
    if (!ok) return;

    setElements((prev) =>
      prev.map((el) =>
        el.id === elementId
          ? {
              ...el,
              subElements: el.subElements.map((sub) =>
                sub.id === subElementId
                  ? {
                      ...sub,
                      details: sub.details.filter((d) => d.id !== detailId),
                    }
                  : sub
              ),
            }
          : el
      )
    );
  };

  const handleDetailClick = (detail) => {
    // 1. Buscar si ya existe una config guardada para este detalle
    const existingConfig = configuredDetails.find((d) => d.id === detail.id);

    // 2. Si existe, usamos esa config; si no, usamos el detalle original
    const detailToEdit = existingConfig || detail;

    console.log("🔍 Detail que se envía al modal:", detailToEdit);

    // 3. Abrimos el modal con el detalle que ya incluye valor, banderas, etc.
    setSelectedDetail(detailToEdit);
    setOpenConfigModal(true);
  };
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
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
  };

  const handleCancelEditProjectDescription = () => {
    setProjectDescription(currentProject?.description || "");
    setIsEditingDescription(false);
  };

  const handleDeleteProject = async () => {
    if (
      !confirm(
        "¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    const projectId = currentProject?._id || currentProject?.id;

    if (!projectId || projectId === "undefined") {
      console.error("❌ ID inválido para eliminar:", projectId);
      alert("Error: No se pudo identificar el proyecto");
      return;
    }

    console.log("🗑️ Eliminando proyecto:", projectId);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        console.log("✅ Proyecto eliminado correctamente");
        deleteProject(projectId); // Actualizar contexto
        router.push("/");
      } else {
        const data = await res.json();
        alert("Error al eliminar: " + (data.message || "Error desconocido"));
      }
    } catch (error) {
      console.error("❌ Error eliminando proyecto:", error);
      alert("Error de conexión al eliminar el proyecto");
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

  const formatDetailValue = (detail) => {
    if (!detail.value) return "Sin valor";

    switch (detail.dataType) {
      case "currency":
      case "number":
        const symbol = detail.currencyType || "";
        // Using toLocaleString for better number formatting with commas
        return `${symbol} ${Number(detail.value).toLocaleString("es-ES")}`;
      case "date":
        return new Date(detail.value).toLocaleDateString("es-ES");
      case "boolean":
        return detail.value === "true" ? "Sí" : "No";
      default:
        return detail.value;
    }
  };

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
              bgcolor: "#f5f5f5",
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
          >
            <LockIcon fontSize="small" />
          </IconButton>

          <IconButton
            onClick={() => setOpenCollaborators(true)}
            title="Gestionar colaboradores"
            size="small"
            sx={{
              bgcolor: "#f5f5f5",
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
          >
            <GroupIcon fontSize="small" />
          </IconButton>

          <Box sx={{ flexGrow: 1, minWidth: { xs: "100%", sm: "auto" } }} />

          <IconButton
            onClick={() => setOpenProjectGroups(true)}
            title="Grupos del proyecto"
            size="small"
            sx={{
              bgcolor: "#f5f5f5",
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
          >
            <GroupIcon fontSize="small" />
          </IconButton>

          <IconButton
            onClick={() => setOpenPermissionsMatrix(true)}
            title="Matriz de permisos"
            size="small"
            sx={{
              bgcolor: "#f5f5f5",
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
          >
            <SecurityIcon fontSize="small" />
          </IconButton>

          {/* NUEVO: Badge de privacidad */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <ProjectPrivacyBadge
              key={`badge-${currentProject?.visibility}-${currentProject?._id}`}
              visibility={currentProject?.visibility || "private"}
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
              key={user?._id || user?.email || "no-user"}
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
              {/*Action Buttons*/}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: { xs: 1, sm: 2 },
                  mb: { xs: 2, sm: 3, md: 4 },
                  flexWrap: "wrap",
                }}
              >
                {/* <Button
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
                </Button> */}
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
              {/* Action Button */}
              <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCreateElement(true)}
                  sx={{
                    textTransform: "none",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1.5, sm: 2 },
                  }}
                >
                  Crear Elemento
                </Button>
              </Box>
              {/* Elements Hierarchy */}
              {elements.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {elements.map((element, elemIndex) => (
                    <Box
                      key={element.id || elemIndex}
                      sx={{
                        bgcolor: "#f9fafb",
                        borderRadius: 2,
                        border: "2px solid #e5e7eb",
                        overflow: "hidden",
                      }}
                    >
                      {/* Element Header */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          p: 2,
                          bgcolor: "#e0e7ff",
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#c7d2fe" },
                        }}
                        onClick={() => toggleElement(elemIndex)}
                      >
                        <IconButton size="small" sx={{ mr: 1 }}>
                          {expandedElements[elemIndex] ? (
                            <ExpandMoreIcon />
                          ) : (
                            <ChevronRightIcon />
                          )}
                        </IconButton>
                        <AccountTreeIcon sx={{ mr: 1, color: "#6366f1" }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {element.name}
                          </Typography>
                          {element.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {element.description}
                            </Typography>
                          )}
                        </Box>
                        {/* botón editar elemento */}
                        <Tooltip title="Editar elemento">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); // para que no colapse/expanda al hacer click
                              setElementToEditIndex(elemIndex);
                              setEditElementName(element.name || "");
                              setEditElementDescription(
                                element.description || ""
                              );
                              setOpenEditElement(true);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar elemento">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteElement(element.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Crear sub-elemento">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedElementIndex(elemIndex);
                              setOpenCreateSubElement(true);
                            }}
                            sx={{
                              bgcolor: "white",
                              "&:hover": { bgcolor: "#f3f4f6" },
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Element Content */}
                      <Collapse
                        in={expandedElements[elemIndex]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ p: 3 }}>
                          {element.subElements &&
                          element.subElements.length > 0 ? (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              {element.subElements.map((subElem, subIndex) => {
                                const subKey = `${elemIndex}-${subIndex}`;
                                return (
                                  <Box
                                    key={subElem.id || subIndex}
                                    sx={{
                                      bgcolor: "#fef3c7",
                                      borderRadius: 1,
                                      border: "1px solid #fcd34d",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {/* Sub-Element Header */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: 1.5,
                                        cursor: "pointer",
                                        "&:hover": { bgcolor: "#fde68a" },
                                      }}
                                      onClick={() =>
                                        toggleSubElement(elemIndex, subIndex)
                                      }
                                    >
                                      <IconButton size="small" sx={{ mr: 1 }}>
                                        {expandedSubElements[subKey] ? (
                                          <ExpandMoreIcon />
                                        ) : (
                                          <ChevronRightIcon />
                                        )}
                                      </IconButton>
                                      <AssignmentIcon
                                        sx={{ mr: 1, color: "#f59e0b" }}
                                      />
                                      <Box sx={{ flexGrow: 1 }}>
                                        <Typography
                                          variant="body1"
                                          fontWeight="500"
                                        >
                                          {subElem.name}
                                        </Typography>
                                        {subElem.description && (
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            {subElem.description}
                                          </Typography>
                                        )}
                                      </Box>
                                      {/* BOTONES EDITAR / ELIMINAR SUB-ELEMENTO */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <Tooltip title="Editar sub-elemento">
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditSubElemIndices({
                                                elem: elemIndex,
                                                sub: subIndex,
                                              });
                                              setEditSubElemName(
                                                subElem.name || ""
                                              );
                                              setEditSubElemDescription(
                                                subElem.description || ""
                                              );
                                              setOpenEditSubElement(true);
                                            }}
                                            sx={{ mr: 0.5 }}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Eliminar sub-elemento">
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSubElement(
                                                element.id,
                                                subElem.id
                                              );
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                      <Tooltip title="Crear detalle">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedElementIndex(elemIndex);
                                            setSelectedSubElementIndex(
                                              subIndex
                                            );
                                            setOpenCreateDetail(true);
                                          }}
                                          sx={{
                                            bgcolor: "white",
                                            "&:hover": { bgcolor: "#f3f4f6" },
                                          }}
                                        >
                                          <AddIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>

                                    {/* Sub-Element Content (Details) */}
                                    <Collapse
                                      in={expandedSubElements[subKey]}
                                      timeout="auto"
                                      unmountOnExit
                                    >
                                      <Box sx={{ p: 2, bgcolor: "#fffbeb" }}>
                                        {subElem.details &&
                                        subElem.details.length > 0 ? (
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: 1.5,
                                            }}
                                          >
                                            {subElem.details.map(
                                              (detail, detailIndex) => (
                                                <Box
                                                  key={detail.id || detailIndex}
                                                  sx={{
                                                    p: 2,
                                                    bgcolor: "white",
                                                    borderRadius: 1,
                                                    borderLeft:
                                                      "3px solid #f59e0b",
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                      bgcolor: "#f9fafb",
                                                    },
                                                  }}
                                                  onClick={() =>
                                                    handleDetailClick(detail)
                                                  }
                                                >
                                                  {/* CABECERA DEL DETALLE */}
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent:
                                                        "space-between",
                                                      mb: 1,
                                                      gap: 1,
                                                    }}
                                                  >
                                                    <Box
                                                      sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1.5,
                                                      }}
                                                    >
                                                      <DescriptionIcon
                                                        fontSize="small"
                                                        sx={{
                                                          color: "#6b7280",
                                                        }}
                                                      />
                                                      <Typography
                                                        variant="body2"
                                                        fontWeight="500"
                                                      >
                                                        {detail.name}
                                                        {detail.required && (
                                                          <Chip
                                                            label="Requerido"
                                                            size="small"
                                                            color="error"
                                                            sx={{
                                                              ml: 1,
                                                              height: 20,
                                                            }}
                                                          />
                                                        )}
                                                      </Typography>
                                                    </Box>

                                                    {/* 🔴 BOTÓN ELIMINAR DETALLE */}
                                                    <Tooltip title="Eliminar detalle">
                                                      <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={(e) => {
                                                          e.stopPropagation(); // para que no abra el modal
                                                          handleDeleteDetail(
                                                            element.id,
                                                            subElem.id,
                                                            detail.id
                                                          );
                                                        }}
                                                      >
                                                        <DeleteIcon fontSize="small" />
                                                      </IconButton>
                                                    </Tooltip>
                                                  </Box>

                                                  {/* resto del contenido del detalle (descripción, chips, etc.) */}
                                                  {detail.description && (
                                                    <Typography
                                                      variant="caption"
                                                      color="text.secondary"
                                                      sx={{
                                                        display: "block",
                                                        mb: 1,
                                                      }}
                                                    >
                                                      {detail.description}
                                                    </Typography>
                                                  )}

                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      gap: 2,
                                                      flexWrap: "wrap",
                                                    }}
                                                  >
                                                    <Chip
                                                      label={detail.dataType}
                                                      size="small"
                                                      sx={{ height: 22 }}
                                                    />
                                                    <Typography variant="body2">
                                                      {formatDetailValue(
                                                        detail
                                                      )}
                                                    </Typography>
                                                  </Box>

                                                  {detail.flags &&
                                                    detail.flags.length > 0 && (
                                                      <Box
                                                        sx={{
                                                          display: "flex",
                                                          gap: 0.5,
                                                          mt: 1,
                                                          flexWrap: "wrap",
                                                        }}
                                                      >
                                                        {detail.flags.map(
                                                          (flag) => (
                                                            <Chip
                                                              key={flag.id}
                                                              label={flag.name}
                                                              size="small"
                                                              icon={
                                                                <FlagIcon />
                                                              }
                                                              sx={{
                                                                bgcolor:
                                                                  flag.color,
                                                                color: "white",
                                                                height: 20,
                                                                fontSize:
                                                                  "0.7rem",
                                                              }}
                                                            />
                                                          )
                                                        )}
                                                      </Box>
                                                    )}
                                                </Box>
                                              )
                                            )}
                                          </Box>
                                        ) : (
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ textAlign: "center", py: 2 }}
                                          >
                                            No hay detalles. Haz clic en + para
                                            agregar.
                                          </Typography>
                                        )}
                                      </Box>
                                    </Collapse>
                                  </Box>
                                );
                              })}
                            </Box>
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ textAlign: "center", py: 3 }}
                            >
                              No hay sub-elementos. Haz clic en + para agregar.
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No hay elementos creados
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Haz clic en &quot;Crear Elemento&quot; para comenzar
                  </Typography>
                </Box>
              )}
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
                  ></Typography>
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
            visibility: updatedProject.visibility,
          });
          updateProject(projectId, { visibility: updatedProject.visibility });
        }}
      />

      {/* Modales de creación de elementos / sub-elementos / detalles */}
      <CreateElementModal
        open={openCreateElement}
        onClose={() => setOpenCreateElement(false)}
        onSave={handleCreateElement}
      />

      <CreateSubElementModal
        open={openCreateSubElement}
        onClose={() => setOpenCreateSubElement(false)}
        onSave={handleCreateSubElement}
        elementName={
          selectedElementIndex !== null
            ? elements[selectedElementIndex]?.name
            : ""
        }
      />

      <CreateDetailModal
        open={openCreateDetail}
        onClose={() => setOpenCreateDetail(false)}
        onSave={handleCreateDetail}
        subElementName={
          selectedElementIndex !== null && selectedSubElementIndex !== null
            ? elements[selectedElementIndex]?.subElements?.[
                selectedSubElementIndex
              ]?.name
            : ""
        }
      />
      <ProjectCollaborators
        open={openCollaborators}
        onClose={() => setOpenCollaborators(false)}
        project={currentProject}
      />
      {/* Modal: Gestor de Grupos */}
      <GroupManager
        open={openGroupManager}
        onClose={() => setOpenGroupManager(false)}
      />

      {/* Modal: Grupos del Proyecto */}
      <ProjectGroupPermissions
        open={openProjectGroups}
        onClose={() => setOpenProjectGroups(false)}
        project={currentProject}
      />

      {/* Modal: Matriz de Permisos */}
      <Dialog
        open={openPermissionsMatrix}
        onClose={() => setOpenPermissionsMatrix(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Matriz de permisos</DialogTitle>
        <DialogContent>
          <PermissionsMatrix project={currentProject} />
        </DialogContent>
      </Dialog>
      {/* Modal: Editar Elemento */}
      <Dialog
        open={openEditElement}
        onClose={(event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
          setOpenEditElement(false);
        }}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar elemento</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {" "}
          {/* <- espacio interno arriba */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              mt: 3,
            }}
          >
            <TextField
              label="Nombre del elemento"
              value={editElementName}
              onChange={(e) => setEditElementName(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Descripción"
              value={editElementDescription}
              onChange={(e) => setEditElementDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditElement(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveElementEdit}
            disabled={!editElementName.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      {/* 🔹 Modal: Editar Sub-elemento */}
      <Dialog
        open={openEditSubElement}
        onClose={(event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
          setOpenEditSubElement(false);
        }}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar sub-elemento</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {" "}
          {/* <- espacio interno arriba */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              mt: 3,
            }}
          >
            <TextField
              label="Nombre del sub-elemento"
              value={editSubElemName}
              onChange={(e) => setEditSubElemName(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Descripción"
              value={editSubElemDescription}
              onChange={(e) => setEditSubElemDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditSubElement(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveSubElementEdit}
            disabled={!editSubElemName.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
