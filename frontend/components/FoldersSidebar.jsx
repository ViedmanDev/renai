"use client";

import { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import FolderItem from "./FolderItem";
import CreateFolderModal from "./CreateFolderModal";
import { useFolders } from "@/hooks/useFolders";

export default function FoldersSidebar({ 
  selectedFolderId, 
  onSelectFolder,
  onFoldersChange 
}) {
  const { 
    loading, 
    error, 
    fetchFolderTree, 
    createFolder, 
    updateFolder, 
    deleteFolder 
  } = useFolders();

  const [folderTree, setFolderTree] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [openModal, setOpenModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [parentFolder, setParentFolder] = useState(null);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    const tree = await fetchFolderTree();
    setFolderTree(tree);
    if (onFoldersChange) {
      onFoldersChange(tree);
    }
  };

  const toggleExpand = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = (parent = null) => {
    setEditingFolder(null);
    setParentFolder(parent);
    setOpenModal(true);
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setParentFolder(null);
    setOpenModal(true);
  };

  const handleDeleteFolder = async (folder) => {
    if (!confirm(`¿Estás seguro de eliminar la carpeta "${folder.name}"?`)) {
      return;
    }

    try {
      await deleteFolder(folder._id);
      await loadFolders();
      if (selectedFolderId === folder._id) {
        onSelectFolder(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveFolder = async (folderData) => {
    if (editingFolder) {
      await updateFolder(editingFolder._id, folderData);
    } else {
      await createFolder(folderData);
    }
    await loadFolders();
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder._id);
    const isSelected = selectedFolderId === folder._id;

    return (
      <FolderItem
        key={folder._id}
        folder={folder}
        level={level}
        isSelected={isSelected}
        isExpanded={isExpanded}
        onSelect={onSelectFolder}
        onToggleExpand={toggleExpand}
        onEdit={handleEditFolder}
        onDelete={handleDeleteFolder}
        onCreateSubfolder={handleCreateFolder}
      >
        {folder.children?.map((child) => renderFolder(child, level + 1))}
      </FolderItem>
    );
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100%',
        bgcolor: 'white',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
          📁 Carpetas
        </Typography>
        <IconButton size="small" onClick={() => handleCreateFolder(null)} title="Nueva carpeta">
          <AddIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Lista de carpetas */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={30} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <List>
          {/* Opción "Todos los proyectos" */}
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
              <ListItemText 
                primary={
                  <Typography variant="body2" sx={{ fontWeight: selectedFolderId === null ? 600 : 400 }}>
                    Todos los proyectos
                  </Typography>
                } 
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {/* Árbol de carpetas */}
          {folderTree.map((folder) => renderFolder(folder))}

          {!loading && folderTree.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No hay carpetas creadas
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Haz clic en el botón + para crear una
              </Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* Modal */}
      <CreateFolderModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSaveFolder}
        folder={editingFolder}
        parentFolder={parentFolder}
      />
    </Box>
  );
}