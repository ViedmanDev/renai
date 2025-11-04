"use client";

/**
 * COMPONENTE: TaskManager
 * PROPÓSITO: Gestión de tareas dentro de un proyecto
 *
 * FUNCIONALIDADES:
 * - Crear nuevas tareas
 * - Marcar tareas como completadas
 * - Editar tareas
 * - Eliminar tareas
 * - Asignar prioridad a tareas
 *
 * CONEXIÓN A BD:
 * Tabla: project_tasks
 * Campos: id, project_id, title, description, status, priority, due_date, created_at
 */

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "./TaskManager.css";

const PRIORITY_LEVELS = [
  { value: "low", label: "Baja", color: "#66bb6a" },
  { value: "medium", label: "Media", color: "#ffee58" },
  { value: "high", label: "Alta", color: "#ffa726" },
  { value: "urgent", label: "Urgente", color: "#ef5350" },
];

export default function TaskManager({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState("");

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskTitle(task.title);
      setTaskDescription(task.description);
      setTaskPriority(task.priority);
      setTaskDueDate(task.dueDate);
    } else {
      setEditingTask(null);
      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("medium");
      setTaskDueDate("");
    }
    setOpenDialog(true);
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) return;

    if (editingTask) {
      setTasks(
        tasks.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: taskTitle,
                description: taskDescription,
                priority: taskPriority,
                dueDate: taskDueDate,
              }
            : t
        )
      );
    } else {
      const newTask = {
        id: Date.now().toString(),
        projectId,
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        dueDate: taskDueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks([...tasks, newTask]);
    }

    setOpenDialog(false);
  };

  const handleToggleTask = (taskId) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const handleDeleteTask = (taskId) => {
    if (confirm("¿Estás seguro de eliminar esta tarea?")) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  const getPriorityColor = (priority) => {
    return (
      PRIORITY_LEVELS.find((p) => p.value === priority)?.color || "#9e9e9e"
    );
  };

  const getPriorityLabel = (priority) => {
    return PRIORITY_LEVELS.find((p) => p.value === priority)?.label || priority;
  };

  return (
    <Box className="task-manager">
      <Box className="task-manager__header">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className="task-manager__add-button"
        >
          Nueva Tarea
        </Button>
      </Box>

      <List className="task-manager__list">
        {tasks.length === 0 ? (
          <Box className="task-manager__empty">
            <Typography variant="body2" color="text.secondary">
              No hay tareas creadas. Haz clic en "Nueva Tarea" para comenzar.
            </Typography>
          </Box>
        ) : (
          tasks.map((task) => (
            <ListItem
              key={task.id}
              className={`task-manager__list-item ${
                task.completed ? "task-manager__list-item--completed" : ""
              }`}
              secondaryAction={
                <Box className="task-manager__actions">
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(task)}
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteTask(task.id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <Checkbox
                checked={task.completed}
                onChange={() => handleToggleTask(task.id)}
              />
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span
                      className={
                        task.completed
                          ? "task-manager__task-title--completed"
                          : ""
                      }
                    >
                      {task.title}
                    </span>
                    <Chip
                      label={getPriorityLabel(task.priority)}
                      size="small"
                      sx={{
                        bgcolor: getPriorityColor(task.priority),
                        color: "white",
                      }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    {task.description && (
                      <Typography variant="body2">
                        {task.description}
                      </Typography>
                    )}
                    {task.dueDate && (
                      <Typography variant="caption" color="text.secondary">
                        Vence:{" "}
                        {new Date(task.dueDate).toLocaleDateString("es-ES")}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItem>
          ))
        )}
      </List>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? "Editar Tarea" : "Nueva Tarea"}
        </DialogTitle>
        <DialogContent>
          <Box className="task-manager__dialog-content">
            <TextField
              label="Título de la tarea"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              fullWidth
              autoFocus
            />

            <TextField
              label="Descripción"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                label="Prioridad"
              >
                {PRIORITY_LEVELS.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: priority.color,
                        }}
                      />
                      {priority.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Fecha de vencimiento"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveTask}
            variant="contained"
            disabled={!taskTitle.trim()}
          >
            {editingTask ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
