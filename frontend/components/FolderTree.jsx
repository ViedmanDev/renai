"use client";

import { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Typography,
  Badge,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function FolderTree({ 
  folders, 
  selectedFolderId, 
  onSelectFolder, 
  onCreateFolder,
  onEditFolder,
  onDeleteFolder 
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const toggleExpand = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder._id);
    const isSelected = selectedFolderId === folder._id;
    const hasChildren = folder.children && folder.children.length > 0;
    const projectCount = folder.projectIds?.length || 0;

    return (
      <Box key={folder._id}>
        <ListItem
          disablePadding
          sx={{
            pl: level * 2,
            bgcolor: isSelected ? '#f3f4f6' : 'transparent',
            borderRadius: 1,
            mb: 0.5,
          }}
          secondaryAction={
            <IconButton size="small" edge="end">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          }
        >
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => toggleExpand(folder._id)}
              sx={{ mr: 0.5 }}
            >
              {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
          )}
          
          <ListItemButton
            onClick={() => onSelectFolder(folder._id)}
            sx={{ py: 0.5, px: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {isExpanded ? (
                <FolderOpenIcon sx={{ color: folder.color || '#6366f1' }} />
              ) : (
                <FolderIcon sx={{ color: folder.color || '#6366f1' }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">{folder.name}</Typography>
                  {projectCount > 0 && (
                    <Badge badgeContent={projectCount} color="primary" />
                  )}
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {folder.children.map((child) => renderFolder(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6">Carpetas</Typography>
        <IconButton size="small" onClick={() => onCreateFolder(null)}>
          <AddIcon />
        </IconButton>
      </Box>

      {/* Raíz / Sin carpeta */}
      <ListItem
        disablePadding
        sx={{
          bgcolor: selectedFolderId === null ? '#f3f4f6' : 'transparent',
          borderRadius: 1,
          mb: 0.5,
        }}
      >
        <ListItemButton onClick={() => onSelectFolder(null)}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <FolderIcon sx={{ color: '#94a3b8' }} />
          </ListItemIcon>
          <ListItemText primary="Todos los proyectos" />
        </ListItemButton>
      </ListItem>

      <List>
        {folders.map((folder) => renderFolder(folder))}
      </List>
    </Box>
  );
}