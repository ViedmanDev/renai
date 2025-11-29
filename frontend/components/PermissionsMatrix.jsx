"use client";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

export default function PermissionsMatrix() {
  const permissions = [
    {
      action: "Ver proyecto",
      description: "Ver contenido del proyecto",
      owner: true,
      editor: true,
      viewer: true,
    },
    {
      action: "Editar proyecto",
      description: "Modificar nombre, descripción y detalles",
      owner: true,
      editor: true,
      viewer: false,
    },
    {
      action: "Eliminar proyecto",
      description: "Eliminar permanentemente el proyecto",
      owner: true,
      editor: false,
      viewer: false,
    },
    {
      action: "Cambiar privacidad",
      description: "Modificar visibilidad del proyecto",
      owner: true,
      editor: false,
      viewer: false,
    },
    {
      action: "Invitar colaboradores individuales",
      description: "Agregar usuarios al proyecto",
      owner: true,
      editor: false,
      viewer: false,
    },
    {
      action: "Gestionar grupos",
      description: "Agregar o remover grupos del proyecto",
      owner: true,
      editor: false,
      viewer: false,
    },
    {
      action: "Cambiar roles",
      description: "Modificar permisos de colaboradores y grupos",
      owner: true,
      editor: false,
      viewer: false,
    },
    {
      action: "Exportar proyecto",
      description: "Descargar proyecto en diferentes formatos",
      owner: true,
      editor: true,
      viewer: true,
    },
    {
      action: "Agregar detalles",
      description: "Añadir campos personalizados",
      owner: true,
      editor: true,
      viewer: false,
    },
    {
      action: "Ver historial",
      description: "Ver cambios y actividad del proyecto",
      owner: true,
      editor: true,
      viewer: true,
    },
  ];

  const PermissionIcon = ({ allowed }) => {
    return allowed ? (
      <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 28 }} />
    ) : (
      <CancelIcon sx={{ color: "#f44336", fontSize: 28 }} />
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📋 Matriz de Permisos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Esta tabla muestra qué puede hacer cada rol en el proyecto
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
                Permiso
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "20%" }}>
                <Chip label="Propietario" color="error" size="small" />
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "20%" }}>
                <Chip label="Editor" color="warning" size="small" />
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "20%" }}>
                <Chip label="Visualizador" color="info" size="small" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map((perm, index) => (
              <TableRow
                key={index}
                sx={{
                  "&:hover": { bgcolor: "#fafafa" },
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {perm.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {perm.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <PermissionIcon allowed={perm.owner} />
                </TableCell>
                <TableCell align="center">
                  <PermissionIcon allowed={perm.editor} />
                </TableCell>
                <TableCell align="center">
                  <PermissionIcon allowed={perm.viewer} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Notas adicionales */}
      <Box sx={{ mt: 3, p: 2, bgcolor: "#e3f2fd", borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          📌 Notas importantes:
        </Typography>
        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
          • Los <strong>permisos de grupo</strong> se aplican a todos los miembros del grupo
        </Typography>
        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
          • Si un usuario tiene múltiples roles (individual + grupo), se aplica el rol con <strong>mayor nivel de permisos</strong>
        </Typography>
        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
          • El <strong>propietario</strong> siempre tiene todos los permisos y no puede ser removido
        </Typography>
        <Typography variant="caption" display="block">
          • Los permisos de <strong>privacidad pública</strong> permiten que cualquiera vea el proyecto (solo lectura)
        </Typography>
      </Box>

      {/* Jerarquía de roles */}
      <Box sx={{ mt: 2, p: 2, bgcolor: "#fff3e0", borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          🔺 Jerarquía de Roles:
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <Chip label="Propietario" color="error" size="small" />
          <Typography variant="caption">→</Typography>
          <Chip label="Editor" color="warning" size="small" />
          <Typography variant="caption">→</Typography>
          <Chip label="Visualizador" color="info" size="small" />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Cada rol hereda los permisos del rol inferior
        </Typography>
      </Box>
    </Box>
  );
}