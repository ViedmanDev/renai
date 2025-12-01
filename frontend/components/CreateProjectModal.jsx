"use client";

/**
 * COMPONENTE: CreateProjectModal
 * PROPÓSITO: Modal para crear nuevos proyectos con opción de agregar foto de portada
 *
 * PROPS:
 * - open (boolean): Controla si el modal está visible
 * - onClose (function): Callback cuando se cierra el modal
 * - onCreateProject (function): Callback cuando se crea un proyecto
 * - selectedFolderId (string): ID de la carpeta seleccionada (✅ NUEVO)
 *
 * ESTADO:
 * - projectName: Nombre del proyecto
 * - projectDescription: Descripción del proyecto
 * - coverImage: Archivo de imagen de portada (File object)
 * - imagePreview: URL de vista previa de la imagen
 *
 * CONEXIÓN A BD:
 * Al crear proyecto, enviar a: POST /api/projects
 * Body: { name, description, coverImage (base64 o FormData), fromTemplate, folderId }
 *
 * CÓMO EXTENDER:
 * - Agregar más campos: categoría, etc.
 * - Agregar validación de tamaño de imagen
 * - Implementar crop de imagen antes de guardar
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

export default function CreateProjectModal({
  open,
  onClose,
  onCreateProject,
  selectedFolderId,
}) {
  const router = useRouter();
  // Estado para el nombre del proyecto
  const [projectName, setProjectName] = useState("");
  // Estado para la descripción del proyecto
  const [projectDescription, setProjectDescription] = useState("");
  // Estado para la imagen de portada
  const [coverImage, setCoverImage] = useState(null);
  // Estado para la vista previa de la imagen
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estado para errores de validación
  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const validateName = (value) => {
    if (!value || value.trim().length === 0) {
      return "El nombre del proyecto es requerido";
    }
    if (value.trim().length < 5) {
      return "El nombre debe tener al menos 5 caracteres";
    }
    if (value.length > 35) {
      return "El nombre no puede exceder 50 caracteres";
    }
    return "";
  };

  //handleNameChange con validación
  const handleNameChange = (e) => {
    const value = e.target.value;
    setProjectName(value);

    // Validar en tiempo real
    const error = validateName(value);
    setErrors((prev) => ({ ...prev, name: error }));
  };

  /**
   * Maneja la selección de imagen de portada
   * Crea una vista previa usando FileReader
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Crea el proyecto con o sin plantilla
   * Incluye la imagen de portada si fue seleccionada
   */
  const handleCreate = async (fromTemplate = false) => {
    const nameError = validateName(projectName);
    if (nameError) {
      setErrors((prev) => ({ ...prev, name: nameError }));
      return;
    }

    if (!projectName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      //Enviar al backend con folderId
      const res = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDescription.trim() || "",
          coverImage: imagePreview || null,
          fromTemplate,
          visibility: "private",
          folderId: selectedFolderId || null,
        }),
      });

      if (res.ok) {
        const newProject = await res.json();
        console.log(" Proyecto creado:", newProject);
        console.log("📁 En carpeta:", selectedFolderId || "Sin carpeta");

        // Llamar callback con el proyecto creado
        onCreateProject(newProject);

        // Limpiar estado
        setProjectName("");
        setProjectDescription("");
        setCoverImage(null);
        setImagePreview(null);
        setErrors({ name: "", description: "" });

        const projectId = newProject._id || newProject.id;
        if (projectId) {
          console.log("🔀 Redirigiendo a:", `/project/${projectId}/canvas`);
          router.push(`/project/${projectId}/canvas`);
        }

        // Llamar callback (opcional, para actualizar lista)
        if (onCreateProject) {
          onCreateProject(newProject);
        }

        // Cerrar modal
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || "Error al crear proyecto");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        onClose();
      }}
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
        <IconButton></IconButton>
      </Box>

      <DialogContent>
        {/* ✅ NUEVO: Mostrar error si existe */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/*Mostrar info de carpeta */}
        {selectedFolderId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            📁 Este proyecto se creará en la carpeta seleccionada
          </Alert>
        )}

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
              disabled={loading}
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
                  cursor: loading ? "not-allowed" : "pointer",
                  overflow: "hidden",
                  "&:hover": {
                    borderColor: loading ? "#ccc" : "#7c4dff",
                    bgcolor: loading ? "transparent" : "#f5f5f5",
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
                    <AddPhotoAlternateIcon
                      sx={{ fontSize: 48, color: "#ccc" }}
                    />
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
            onChange={handleNameChange}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="Ingresa el nombre"
            sx={{ mb: 2 }}
            disabled={loading}
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
            disabled={loading}
          />

          <Button
            variant="contained"
            onClick={() => handleCreate(false)}
            disabled={!projectName.trim() || !!errors.name || loading}
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
              "&:disabled": {
                bgcolor: "#ccc",
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                Creando...
              </>
            ) : (
              "Crear en blanco"
            )}
          </Button>

          <Button
            variant="contained"
            onClick={() => handleCreate(true)}
            disabled={!projectName.trim() || !!errors.name || loading}
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
              "&:disabled": {
                bgcolor: "#ccc",
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                Creando...
              </>
            ) : (
              "Crear desde plantilla"
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
