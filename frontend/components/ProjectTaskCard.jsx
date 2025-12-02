"use client";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import FlagIcon from "@mui/icons-material/Flag";

export default function ProjectTaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
      default:
        return priority;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "todo":
        return "Por hacer";
      case "in_progress":
        return "En progreso";
      case "done":
        return "Completada";
      default:
        return status;
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

  return (
    <Card
      sx={{
        border: "1px solid #e0e0e0",
        boxShadow: "none",
        "&:hover": {
          boxShadow: 2,
          borderColor: "#2c2c2c",
        },
        transition: "all 0.2s",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          {/* Título y descripción */}
          <Box sx={{ flexGrow: 1, mr: 2 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{
                textDecoration: task.status === "done" ? "line-through" : "none",
                color: task.status === "done" ? "text.secondary" : "text.primary",
              }}
            >
              {task.title}
            </Typography>

            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {task.description}
              </Typography>
            )}
          </Box>

          {/* Acciones */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton size="small" onClick={() => onEdit(task)} title="Editar">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(task._id)}
              title="Eliminar"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Metadata */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mt: 2 }}>
          {/* Estado */}
          <Select
            size="small"
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="todo">Por hacer</MenuItem>
            <MenuItem value="in_progress">En progreso</MenuItem>
            <MenuItem value="done">Completada</MenuItem>
          </Select>

          {/* Prioridad */}
          <Chip
            icon={<FlagIcon />}
            label={getPriorityLabel(task.priority)}
            color={getPriorityColor(task.priority)}
            size="small"
          />

          {/* Fecha de vencimiento */}
          {task.dueDate && (
            <Chip
              icon={<CalendarTodayIcon />}
              label={formatDate(task.dueDate)}
              size="small"
              color={isOverdue ? "error" : "default"}
              variant={isOverdue ? "filled" : "outlined"}
            />
          )}

          {/* Asignado a */}
          {task.assignedTo && (
            <Tooltip title={task.assignedTo.name || task.assignedTo.email}>
              <Avatar
                src={task.assignedTo.picture}
                sx={{ width: 28, height: 28 }}
              >
                {(task.assignedTo.name || task.assignedTo.email)?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Tooltip>
          )}

          {/* Tags */}
          {task.tags?.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}