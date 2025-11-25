"use client";

import { useState } from "react";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Box,
  Typography,
  Collapse,
  List,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function FolderItem({
  folder,
  level = 0,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onEdit,
  onDelete,
  onCreateSubfolder,
  children,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const hasChildren = folder.children && folder.children.length > 0;
  const projectCount = folder.projectIds?.length || 0;

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          pl: level * 2,
          bgcolor: isSelected ? '#f3f4f6' : 'transparent',
          borderRadius: 1,
          mb: 0.5,
          '&:hover': {
            bgcolor: isSelected ? '#f3f4f6' : '#fafafa',
          },
        }}
        secondaryAction={
          <IconButton size="small" edge="end" onClick={handleMenuClick}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        }
      >
        {hasChildren && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(folder._id);
            }}
            sx={{ mr: 0.5 }}
          >
            {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}

        <ListItemButton onClick={() => onSelect(folder._id)} sx={{ py: 1, px: 1 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Box sx={{ fontSize: '1.5rem' }}>
              {folder.icon || '📁'}
            </Box>
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                  {folder.name}
                </Typography>
                {projectCount > 0 && (
                  <Badge 
                    badgeContent={projectCount} 
                    color="primary" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            }
            secondary={folder.description && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {folder.description}
              </Typography>
            )}
          />
        </ListItemButton>
      </ListItem>

      {/* Menú contextual */}
      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onEdit(folder);
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onCreateSubfolder(folder);
          }}
        >
          <CreateNewFolderIcon fontSize="small" sx={{ mr: 1 }} />
          Nueva subcarpeta
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onDelete(folder);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Subcarpetas */}
      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List disablePadding>
            {children}
          </List>
        </Collapse>
      )}
    </>
  );
}