"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Container, Grid, IconButton, TextField, InputAdornment, Avatar, Button } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import MenuIcon from "@mui/icons-material/Menu"
import AppsIcon from "@mui/icons-material/Apps"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import LogoutIcon from "@mui/icons-material/Logout"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useProjects } from "@/contexts/ProjectContext"
import { useAuth } from "@/contexts/AuthContext"
import CreateProjectModal from "@/components/CreateProjectModal"
import ProjectCard from "@/components/ProjectCard"
import SetPasswordModal from "@/components/SetPasswordModal"

export default function HomePage() {
  const router = useRouter()
  const { projects, createProject, setCurrentProject, reorderProjects } = useProjects()
  const { user, logout } = useAuth()
  const [openModal, setOpenModal] = useState(false)
  const [openPasswordModal, setOpenPasswordModal] = useState(false)

  const handleCreateProject = (projectData) => {
    const newProject = createProject(projectData)
    setCurrentProject(newProject)
    setOpenModal(false)
    router.push(`/project/${newProject.id}/details`)
  }

  const handleViewProject = (project) => {
    setCurrentProject(project)
    router.push(`/project/${project.id}`)
  }

  const handleEditProject = (project) => {
    setCurrentProject(project)
    router.push(`/project/${project.id}/details`)
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return
    reorderProjects(result.source.index, result.destination.index)
  }

  const handleLogout = () => {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
      logout()
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
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
            placeholder="Hinted search text"
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
          <Button variant="text" sx={{ textTransform: "none", color: "text.primary" }}>
            {user?.name || "Usuario"}
          </Button>
          
          {/* Avatar con foto de Google o inicial */}
          <Avatar 
            sx={{ bgcolor: "#5e35b1" }}
            src={user?.picture}
          >
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects-list" direction="horizontal">
            {(provided, snapshot) => (
              <Grid
                container
                spacing={3}
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  bgcolor: snapshot.isDraggingOver ? "#f5f3ff" : "transparent",
                  transition: "background-color 0.2s ease",
                  borderRadius: 2,
                  p: 1,
                }}
              >
                {/* New Project Card */}
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <ProjectCard isNew onView={() => setOpenModal(true)} />
                </Grid>

                {projects.map((project, index) => (
                  <Draggable key={project.id} draggableId={project.id} index={index}>
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
                          transform: snapshot.isDragging ? "rotate(2deg)" : "none",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        <ProjectCard project={project} onView={handleViewProject} onEdit={handleEditProject} />
                      </Grid>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Grid>
            )}
          </Droppable>
        </DragDropContext>
      </Container>

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
  )
}