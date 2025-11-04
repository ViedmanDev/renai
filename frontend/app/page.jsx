"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Container, Grid, IconButton, TextField, InputAdornment, Avatar, Button } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import MenuIcon from "@mui/icons-material/Menu"
import AppsIcon from "@mui/icons-material/Apps"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useProjects } from "@/contexts/ProjectContext"
import CreateProjectModal from "@/components/CreateProjectModal"
import ProjectCard from "@/components/ProjectCard"

export default function HomePage() {
  const router = useRouter()
  const { projects, createProject, setCurrentProject, reorderProjects } = useProjects()
  const [openModal, setOpenModal] = useState(false)

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
          <Button variant="text" sx={{ textTransform: "none", color: "text.primary" }}>
            User name example
          </Button>
          <Avatar sx={{ bgcolor: "#5e35b1" }}>J</Avatar>
          <IconButton>
            <ChevronRightIcon />
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

      <CreateProjectModal open={openModal} onClose={() => setOpenModal(false)} onCreateProject={handleCreateProject} />
    </Box>
  )
}
