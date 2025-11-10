"use client"

/**
 * CONTEXTO: ProjectContext
 * PROPÓSITO: Gestión global del estado de proyectos y detalles
 *
 * ESTADO GLOBAL:
 * - projects: Array de todos los proyectos
 * - currentProject: Proyecto actualmente seleccionado
 * - selectedDetails: Detalles seleccionados para el proyecto actual
 * - configuredDetails: Detalles con configuración completa (valores, banderas, etc.)
 *
 * FUNCIONES:
 * - createProject: Crea un nuevo proyecto
 * - updateProject: Actualiza datos de un proyecto
 * - addDetailToProject: Agrega un detalle a un proyecto
 * - reorderProjects: Reordena proyectos con drag and drop
 * - reorderDetails: Reordena detalles con drag and drop
 * - updateDetailConfig: Actualiza configuración de un detalle específico
 * - deleteProject: Elimina un proyecto
 *
 * CONEXIÓN A BD:
 * Este contexto debe sincronizarse con las siguientes tablas:
 * - projects: id, name, description, cover_image, created_at
 * - project_details: id, project_id, detail_type_id, order_index, config (JSON)
 * - project_detail_configs: detail_id, field_name, flags, privacy, decimals, value
 *
 * ESCALABILIDAD:
 * Para agregar nuevos tipos de detalles:
 * 1. Agregar definición en constants/detailTypes.js
 * 2. Actualizar la tabla detail_types en BD
 * 3. Crear componente de visualización si es necesario
 */

import { createContext, useContext, useState } from "react"

const ProjectContext = createContext()

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [selectedDetails, setSelectedDetails] = useState([])
  const [configuredDetails, setConfiguredDetails] = useState([])

  const createProject = (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      name: projectData.name,
      description: projectData.description || "",
      coverImage: projectData.coverImage || null,
      createdAt: new Date().toISOString(),
      details: [],
    }
    setProjects([...projects, newProject])
    return newProject
  }

  const updateProject = (projectId, updates) => {
    setProjects(projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p)))
  }

  const addDetailToProject = (projectId, detail) => {
    setProjects(projects.map((p) => (p.id === projectId ? { ...p, details: [...(p.details || []), detail] } : p)))
  }

  const reorderProjects = (sourceIndex, destinationIndex) => {
    const items = Array.from(projects)
    const [reorderedItem] = items.splice(sourceIndex, 1)
    items.splice(destinationIndex, 0, reorderedItem)
    setProjects(items)
  }

  const reorderDetails = (sourceIndex, destinationIndex) => {
    const items = Array.from(selectedDetails)
    const [reorderedItem] = items.splice(sourceIndex, 1)
    items.splice(destinationIndex, 0, reorderedItem)
    setSelectedDetails(items)
  }

  const updateDetailConfig = (detailId, config) => {
    setConfiguredDetails((prev) => {
      const exists = prev.find((d) => d.id === detailId)
      if (exists) {
        return prev.map((d) => (d.id === detailId ? { ...d, ...config } : d))
      }
      return [...prev, { id: detailId, ...config }]
    })
  }

  const getDetailConfig = (detailId) => {
    return configuredDetails.find((d) => d.id === detailId)
  }

  const deleteProject = (projectId) => {
    setProjects(projects.filter((p) => p.id !== projectId))
    if (currentProject?.id === projectId) {
      setCurrentProject(null)
      setSelectedDetails([])
      setConfiguredDetails([])
    }
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        selectedDetails,
        configuredDetails,
        setCurrentProject,
        setSelectedDetails,
        setConfiguredDetails,
        createProject,
        updateProject,
        addDetailToProject,
        reorderProjects,
        reorderDetails,
        updateDetailConfig,
        getDetailConfig,
        deleteProject, // Exportar función de eliminación
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProjects must be used within ProjectProvider")
  }
  return context
}
