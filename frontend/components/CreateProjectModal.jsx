"use client"

/**
 * COMPONENTE: CreateProjectModal
 * PROPÓSITO: Modal para crear nuevos proyectos con opción de agregar foto de portada
 *
 * PROPS:
 * - open (boolean): Controla si el modal está visible
 * - onClose (function): Callback cuando se cierra el modal
 * - onCreateProject (function): Callback cuando se crea un proyecto
 *
 * ESTADO:
 * - projectName: Nombre del proyecto
 * - projectDescription: Descripción del proyecto
 * - coverImage: Archivo de imagen de portada (File object)
 * - imagePreview: URL de vista previa de la imagen
 *
 * CONEXIÓN A BD:
 * Al crear proyecto, enviar a: POST /api/projects
 * Body: { name, description, coverImage (base64 o FormData), fromTemplate }
 *
 * CÓMO EXTENDER:
 * - Agregar más campos: categoría, etc.
 * - Agregar validación de tamaño de imagen
 * - Implementar crop de imagen antes de guardar
 */

import { useState } from "react"
import { Dialog, DialogContent, TextField, Button, Box, IconButton, Typography } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import EditIcon from "@mui/icons-material/Edit"
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"

export default function CreateProjectModal({ open, onClose, onCreateProject }) {
  // Estado para el nombre del proyecto
  const [projectName, setProjectName] = useState("")
  // Estado para la descripción del proyecto
  const [projectDescription, setProjectDescription] = useState("")
  // Estado para la imagen de portada
  const [coverImage, setCoverImage] = useState(null)
  // Estado para la vista previa de la imagen
  const [imagePreview, setImagePreview] = useState(null)

  /**
   * Maneja la selección de imagen de portada
   * Crea una vista previa usando FileReader
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImage(file)
      // Crear vista previa
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  /**
   * Crea el proyecto con o sin plantilla
   * Incluye la imagen de portada si fue seleccionada
   */
  const handleCreate = (fromTemplate = false) => {
    if (projectName.trim()) {
      onCreateProject({
        name: projectName,
        description: projectDescription,
        coverImage: imagePreview, // Base64 de la imagen
        fromTemplate,
      })
      // Limpiar estado
      setProjectName("")
      setProjectDescription("")
      setCoverImage(null)
      setImagePreview(null)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={onClose} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Crear Proyecto
        </Typography>
        <IconButton>
          <EditIcon />
        </IconButton>
      </Box>

      <DialogContent>
        <Box
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Box sx={{ textAlign: "center", width: "100%" }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Foto de portada (opcional)
            </Typography>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="cover-image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="cover-image-upload">
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  margin: "0 auto",
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  "&:hover": {
                    borderColor: "#7c4dff",
                    bgcolor: "#f5f5f5",
                  },
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: "center" }}>
                    <AddPhotoAlternateIcon sx={{ fontSize: 48, color: "#ccc" }} />
                    <Typography variant="caption" color="text.secondary">
                      Click para agregar imagen
                    </Typography>
                  </Box>
                )}
              </Box>
            </label>
          </Box>

          <Typography variant="body2" sx={{ mb: 2 }}>
            Nombre del proyecto
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Ingresa el nombre"
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" sx={{ mb: 2 }}>
            Descripción (opcional)
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Breve descripción del proyecto"
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            onClick={() => handleCreate(false)}
            disabled={!projectName.trim()}
            sx={{
              bgcolor: "#2c2c2c",
              color: "white",
              textTransform: "none",
              px: 4,
              py: 1.5,
              borderRadius: 2,
              "&:hover": {
                bgcolor: "#1a1a1a",
              },
            }}
          >
            Crear en blanco
          </Button>

          <Button
            variant="contained"
            onClick={() => handleCreate(true)}
            disabled={!projectName.trim()}
            sx={{
              bgcolor: "#2c2c2c",
              color: "white",
              textTransform: "none",
              px: 4,
              py: 1.5,
              borderRadius: 2,
              "&:hover": {
                bgcolor: "#1a1a1a",
              },
            }}
          >
            Crear desde plantilla
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
