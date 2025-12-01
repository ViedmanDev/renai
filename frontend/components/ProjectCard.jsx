"use client";

import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function ProjectCard({
  project,
  onView,
  onEdit,
  isNew = false,
}) {
  if (isNew) {
    return (
      <Card
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          bgcolor: "#f5f5f5",
          "&:hover": {
            bgcolor: "#eeeeee",
          },
        }}
        onClick={onView}
      >
        <Box sx={{ textAlign: "center", p: 4 }}>
          <AddIcon sx={{ fontSize: 60, color: "#9e9e9e", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nuevo Proyecto
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          height: 200,
          bgcolor: "#e8e4f3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {project.coverImage ? (
          <img
            src={project.coverImage || "/placeholder.svg"}
            alt={project.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Box sx={{ textAlign: "center", color: "#9e9e9e" }}>
            <Box component="span" sx={{ fontSize: 80 }}>
              ⚙️
            </Box>
            <Box component="span" sx={{ fontSize: 60 }}>
              📋
            </Box>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {project.name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          gutterBottom
        >
          {new Date(project.createdAt).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {project.description || "Sin descripción"}
        </Typography>
      </CardContent>

      <Box sx={{ p: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onView(project)}
          sx={{ textTransform: "none" }}
        >
          Ver
        </Button>
        {/* <Button
          variant="contained"
          size="small"
          onClick={() => onEdit(project)}
          sx={{
            bgcolor: "#7c4dff",
            textTransform: "none",
            "&:hover": {
              bgcolor: "#6a3de8",
            },
          }}
        >
          Editar
        </Button> */}
      </Box>
    </Card>
  );
}
