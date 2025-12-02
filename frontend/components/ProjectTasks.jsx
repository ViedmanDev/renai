"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  LinearProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ProjectTaskFormDialog from "./ProjectTaskFormDialog";
import ProjectTaskCard from "./ProjectTaskCard";

export default function ProjectTasks({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [stats, setStats] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (projectId) {
      loadTasks();
      loadStats();
    }
  }, [projectId]);

  useEffect(() => {
    filterTasks();
  }, [tasks, selectedTab, searchTerm]);

  const loadTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/tasks/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Tareas cargadas:", data);
        setTasks(data);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Error al cargar tareas");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/tasks/project/${projectId}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("❌ Error cargando stats:", error);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Filtrar por estado (tab)
    if (selectedTab !== "all") {
      filtered = filtered.filter((task) => task.status === selectedTab);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(term) ||
          task.description?.toLowerCase().includes(term) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (taskData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/tasks/project/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        console.log("✅ Tarea creada");
        setOpenTaskDialog(false);
        loadTasks();
        loadStats();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Error al crear tarea");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        console.log("✅ Tarea actualizada");
        setOpenTaskDialog(false);
        setSelectedTask(null);
        loadTasks();
        loadStats();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Error al actualizar tarea");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("¿Estás seguro de eliminar esta tarea?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        console.log("✅ Tarea eliminada");
        loadTasks();
        loadStats();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Error al eliminar tarea");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError("Error de conexión");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        console.log("✅ Estado actualizado");
        loadTasks();
        loadStats();
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(filteredTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFilteredTasks(items);

    // Guardar orden en BD
    try {
      const token = localStorage.getItem("token");
      const taskIds = items.map((t) => t._id);

      await fetch(`${API_URL}/tasks/project/${projectId}/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskIds }),
      });

      console.log("✅ Orden guardado");
    } catch (error) {
      console.error("❌ Error al guardar orden:", error);
      loadTasks(); // Revertir
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setOpenTaskDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "default";
      case "in_progress":
        return "info";
      case "done":
        return "success";
      default:
        return "default";
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

  const completionPercentage = stats
    ? Math.round((stats.done / stats.total) * 100) || 0
    : 0;

  return (
  <Box sx={{ height: "100%", display: "flex", flexDirection: "column", p:3 }}>
    {/* Header compacto */}
    <Box sx={{ mb: 2 }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => {
          setSelectedTask(null);
          setOpenTaskDialog(true);
        }}
        fullWidth
        sx={{
          bgcolor: "#2c2c2c",
          "&:hover": { bgcolor: "#1a1a1a" },
        }}
      >
        Nueva Tarea
      </Button>
    </Box>

    {/* Estadísticas compactas */}
    {stats && (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
          <Chip label={`Total: ${stats.total}`} size="small" />
          <Chip label={`✓ ${stats.done}`} size="small" color="success" />
        </Box>
        <LinearProgress
          variant="determinate"
          value={completionPercentage}
          sx={{ height: 6, borderRadius: 1 }}
        />
      </Box>
    )}

    {/* Tabs compactos */}
    <Tabs
      value={selectedTab}
      onChange={(e, val) => setSelectedTab(val)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ mb: 1, minHeight: 36 }}
    >
      <Tab label="Todas" value="all" sx={{ minHeight: 36, py: 0.5 }} />
      <Tab label="Por hacer" value="todo" sx={{ minHeight: 36, py: 0.5 }} />
      <Tab label="En progreso" value="in_progress" sx={{ minHeight: 36, py: 0.5 }} />
      <Tab label="✓" value="done" sx={{ minHeight: 36, py: 0.5 }} />
    </Tabs>

    {/* Error */}
    {error && (
      <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError("")}>
        {error}
      </Alert>
    )}

    {/* Loading */}
    {loading && <LinearProgress sx={{ mb: 1 }} />}

    {/* Lista de tareas - SIN drag & drop para simplificar */}
    <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
      {filteredTasks.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {searchTerm
              ? "No se encontraron tareas"
              : selectedTab === "all"
              ? "No hay tareas"
              : `No hay tareas "${getStatusLabel(selectedTab)}"`}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {filteredTasks.map((task) => (
            <ProjectTaskCard
              key={task._id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </Box>
      )}
    </Box>

    {/* Dialog para crear/editar */}
    <ProjectTaskFormDialog
      open={openTaskDialog}
      onClose={() => {
        setOpenTaskDialog(false);
        setSelectedTask(null);
      }}
      task={selectedTask}
      onSubmit={(data) => {
        if (selectedTask) {
          handleUpdateTask(selectedTask._id, data);
        } else {
          handleCreateTask(data);
        }
      }}
    />
  </Box>
);
}