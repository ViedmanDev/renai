import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useFolders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  // Cargar todas las carpetas
  const fetchFolders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/folders`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error('Error al cargar carpetas');

      const data = await res.json();
      setFolders(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Cargar árbol jerárquico
  const fetchFolderTree = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/folders/tree`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error('Error al cargar árbol');

      const data = await res.json();
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Crear carpeta
  const createFolder = async (folderData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/folders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(folderData),
      });

      if (!res.ok) throw new Error('Error al crear carpeta');

      const data = await res.json();
      await fetchFolders(); // Recargar lista
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar carpeta
  const updateFolder = async (folderId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/folders/${folderId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Error al actualizar carpeta');

      const data = await res.json();
      await fetchFolders();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar carpeta
  const deleteFolder = async (folderId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/folders/${folderId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al eliminar carpeta');
      }

      await fetchFolders();
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mover proyecto a carpeta
  const moveProjectToFolder = async (projectId, folderId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/folders/move-project`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ projectId, folderId }),
      });

      if (!res.ok) throw new Error('Error al mover proyecto');

      const data = await res.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener proyectos de una carpeta
  const getProjectsByFolder = async (folderId) => {
    setLoading(true);
    setError(null);
    try {
      const id = folderId || 'root';
      const res = await fetch(`${API_URL}/folders/${id}/projects`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error('Error al cargar proyectos');

      const data = await res.json();
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    folders,
    loading,
    error,
    fetchFolders,
    fetchFolderTree,
    createFolder,
    updateFolder,
    deleteFolder,
    moveProjectToFolder,
    getProjectsByFolder,
  };
}