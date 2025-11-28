"use client";

/**
 * COMPONENTE: AdminDrawer
 * PROPÓSITO: Menú lateral administrativo para gestión de recursos del sistema
 *
 * FUNCIONALIDADES:
 * - Gestión de etiquetas (CRUD)
 * - Gestión de parámetros personalizados (CRUD)
 * - Gestión de tipos de detalles personalizados
 * - Configuración de tablas dinámicas
 *
 * CONEXIÓN A BD:
 * Lee/Escribe en: tags, custom_parameters, detail_types, dynamic_tables
 *
 * ESCALABILIDAD:
 * Para agregar nuevas opciones administrativas:
 * 1. Agregar nuevo item en menuItems array
 * 2. Crear componente de gestión correspondiente
 * 3. Agregar ruta en el switch de renderContent
 */

import { useState } from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LabelIcon from "@mui/icons-material/Label";
import SettingsIcon from "@mui/icons-material/Settings";
import TableChartIcon from "@mui/icons-material/TableChart";
import ExtensionIcon from "@mui/icons-material/Extension";
import TagManager from "./TagManager";
import ParameterManager from "./ParameterManager";
import DetailTypeManager from "./DetailTypeManager";
import "./AdminDrawer.css";

export default function AdminDrawer({ open, onClose }) {
  const [selectedOption, setSelectedOption] = useState("tags");

  const menuItems = [
    { id: "tags", label: "Gestión de Etiquetas", icon: <LabelIcon /> },
    {
      id: "parameters",
      label: "Gestión de Parámetros",
      icon: <SettingsIcon />,
    },
    { id: "detailTypes", label: "Tipos de Detalles", icon: <ExtensionIcon /> },
    { id: "tables", label: "Tablas Dinámicas", icon: <TableChartIcon /> },
  ];

  /**
   * Renderiza el contenido según la opción seleccionada
   * Para agregar nuevas opciones: agregar case en el switch
   */
  const renderContent = () => {
    switch (selectedOption) {
      case "tags":
        return <TagManager />;
      case "parameters":
        return <ParameterManager />;
      // case "detailTypes":
      //   return <DetailTypeManager />;
      case "tables":
        return (
          <Box className="admin-drawer__content-placeholder">
            <Typography variant="h6">Gestión de Tipos de Detalles</Typography>
            <Typography variant="body2" color="text.secondary"></Typography>
          </Box>
        );
      case "tables":
        return (
          <Box className="admin-drawer__content-placeholder">
            <Typography variant="h6">Gestión de Tablas Dinámicas</Typography>
            <Typography variant="body2" color="text.secondary">
              Aquí podrás crear y gestionar tablas dinámicas para el sistema
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      className="admin-drawer"
    >
      <Box className="admin-drawer__container">
        {/* Header */}
        <Box className="admin-drawer__header">
          <Typography variant="h6" className="admin-drawer__title">
            Panel Administrativo
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Menu List */}
        <List className="admin-drawer__menu">
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={selectedOption === item.id}
                onClick={() => setSelectedOption(item.id)}
                className="admin-drawer__menu-item"
              >
                <ListItemIcon className="admin-drawer__menu-icon">
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        {/* Content Area */}
        <Box className="admin-drawer__content">{renderContent()}</Box>
      </Box>
    </Drawer>
  );
}
