"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Grid,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Button,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import AppsIcon from "@mui/icons-material/Apps";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LogoutIcon from "@mui/icons-material/Logout";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useProjects } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFolders } from "@/hooks/useFolders";
import CreateProjectModal from "@/components/CreateProjectModal";
import ProjectCard from "@/components/ProjectCard";
import SetPasswordModal from "@/components/SetPasswordModal";
import FoldersSidebar from "@/components/FoldersSidebar";

export default function HomePage() {
  const router = useRouter();
  const { projects, createProject, setCurrentProject, reorderProjects } = useProjects();
  const { user, logout } = useAuth();
  const { moveProjectToFolder, getProjectsByFolder } = useFolders();

  const [openModal, setOpenModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [realProjects, setRealProjects] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Cargar proyectos del backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token || token === "undefined" || token === "null") {
          console.log("⚠️ No hay token válido, omitiendo carga de proyectos");
          setLoadingProjects(false);
          return;
        }

        const res = await fetch(`${API_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("✅ Proyectos cargados del backend:", data);
          setRealProjects(data);
        } else {
          console.log("⚠️ Error al cargar proyectos:", res.status);
          if (res.status === 401) {
            localStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.error("Error cargando proyectos:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [API_URL]);

  // Filtrar proyectos por carpeta seleccionada
  useEffect(() => {
    if (selectedFolderId === null) {
      // Mostrar todos los proyectos
      setFilteredProjects(realProjects.length > 0 ? realProjects : projects);
    } else {
      // Filtrar por carpeta
      loadProjectsByFolder(selectedFolderId);
    }
  }, [selectedFolderId, realProjects, projects]);

  const loadProjectsByFolder = async (folderId) => {
    setLoadingProjects(true);
    try {
      const projectsInFolder = await getProjectsByFolder(folderId);
      setFilteredProjects(projectsInFolder);
    } catch (error) {
      console.error("Error cargando proyectos de carpeta:", error);
      setFilteredProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleCreateProject = (projectData) => {
    const newProject = createProject(projectData);
    setCurrentProject(newProject);
    setOpenModal(false);
    router.push(`/project/${newProject.id}/details`);
  };

  const handleViewProject = (project) => {
    setCurrentProject(project);
    router.push(`/project/${project.id}`);
  };

  const handleEditProject = (project) => {
    setCurrentProject(project);
    router.push(`/project/${project.id}/details`);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Si se mueve a una carpeta diferente
    if (destination.droppableId !== source.droppableId) {
      const projectId = draggableId;
      const newFolderId = destination.droppableId === "root" ? null : destination.droppableId;

      try {
        await moveProjectToFolder(projectId, newFolderId);
        
        // Recargar proyectos
        if (selectedFolderId === null) {
          // Recargar todos
          window.location.reload();
        } else {
          loadProjectsByFolder(selectedFolderId);
        }
      } catch (error) {
        console.error("Error moviendo proyecto:", error);
        alert("Error al mover el proyecto: " + error.message);
      }
    } else {
      // Reordenar dentro de la misma carpeta
      reorderProjects(source.index, destination.index);
    }
  };

  const handleLogout = () => {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
      logout();
    }
  };

  const handleSelectFolder = (folderId) => {
    setSelectedFolderId(folderId);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", display: "flex" }}>
      {/* Sidebar de carpetas */}
      <FoldersSidebar
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleSelectFolder}
      />

      {/* Contenido principal */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            bgcolor: "white",
            borderBottom: "1px solid #e0e0e0",
            px: 3,
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton>
              <AppsIcon />
            </IconButton>
            <TextField
              size="small"
              placeholder="Buscar proyectos..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MenuIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                flexGrow: 1,
                maxWidth: 400,
                bgcolor: "#f5f3ff",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />

            <Box sx={{ flexGrow: 1 }} />

            {/* Botón de establecer contraseña */}
            {user && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setOpenPasswordModal(true)}
                sx={{ mr: 2 }}
              >
                Establecer Contraseña
              </Button>
            )}

            {/* Nombre del usuario */}
            <Button
              variant="text"
              sx={{ textTransform: "none", color: "text.primary" }}
            >
              {user?.name || "Usuario"}
            </Button>

            {/* Avatar con foto de Google o inicial */}
            <Avatar sx={{ bgcolor: "#5e35b1" }} src={user?.picture}>
              {!user?.picture && (user?.name?.charAt(0) || "U")}
            </Avatar>

            {/* Botón de Logout */}
            <IconButton
              onClick={handleLogout}
              color="error"
              title="Cerrar sesión"
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
          {/* Breadcrumb / Título */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {selectedFolderId === null
                ? "📂 Todos los proyectos"
                : "📁 Carpeta seleccionada"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredProjects.length} proyecto
              {filteredProjects.length !== 1 ? "s" : ""}
            </Typography>
          </Box>

          {loadingProjects ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography>Cargando proyectos...</Typography>
            </Box>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable
                droppableId={selectedFolderId || "root"}
                direction="horizontal"
              >
                {(provided, snapshot) => (
                  <Grid
                    container
                    spacing={3}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      bgcolor: snapshot.isDraggingOver
                        ? "#f5f3ff"
                        : "transparent",
                      transition: "background-color 0.2s ease",
                      borderRadius: 2,
                      p: 1,
                      minHeight: 200,
                    }}
                  >
                    {/* New Project Card */}
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <ProjectCard isNew onView={() => setOpenModal(true)} />
                    </Grid>

                    {filteredProjects.map((project, index) => (
                      <Draggable
                        key={project.id || project._id}
                        draggableId={project.id || project._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              transform: snapshot.isDragging
                                ? "rotate(2deg)"
                                : "none",
                              transition: "transform 0.2s ease",
                            }}
                          >
                            <ProjectCard
                              project={project}
                              onView={handleViewProject}
                              onEdit={handleEditProject}
                            />
                          </Grid>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {!loadingProjects && filteredProjects.length === 0 && (
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: "center", py: 8 }}>
                          <Typography variant="h6" color="text.secondary">
                            No hay proyectos en esta carpeta
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Arrastra proyectos aquí o crea uno nuevo
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Container>
      </Box>

      {/* Modals */}
      <CreateProjectModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreateProject={handleCreateProject}
      />

      <SetPasswordModal
        isOpen={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
        onSuccess={() => {
          console.log("Contraseña establecida exitosamente");
        }}
      />
    </Box>
  );
}
