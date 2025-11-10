/**
 * SERVICIO DE PROYECTOS
 *
 * Este archivo maneja todas las operaciones relacionadas con proyectos.
 * Actúa como capa intermedia entre los componentes y la API.
 *
 * FUNCIONES:
 * - getAllProjects: Obtener lista de proyectos
 * - getProject: Obtener un proyecto específico
 * - createProject: Crear nuevo proyecto
 * - updateProject: Actualizar proyecto existente
 * - deleteProject: Eliminar proyecto
 * - reorderProjects: Cambiar orden de proyectos
 * - uploadCoverImage: Subir imagen de portada
 *
 * CÓMO CONECTAR CON BACKEND:
 * El backend debe implementar los endpoints especificados en config/api.js
 *
 * EJEMPLO DE CONTROLADOR EN BACKEND (Node.js/Express):
 *
 * // backend/controllers/projectController.js
 * exports.getAllProjects = async (req, res) => {
 *   try {
 *     const projects = await Project.findAll({ where: { userId: req.user.id } });
 *     res.json(projects);
 *   } catch (error) {
 *     res.status(500).json({ message: error.message });
 *   }
 * };
 */

import { get, post, put, deleteRequest, uploadFile } from "./api"
import { API_ENDPOINTS, UPLOAD_URL } from "../config/api"

/**
 * OBTENER TODOS LOS PROYECTOS
 *
 * Obtiene la lista completa de proyectos del usuario actual
 *
 * @returns {Promise<Array>} - Array de proyectos
 *
 * ESTRUCTURA DE RESPUESTA ESPERADA DEL BACKEND:
 * [
 *   {
 *     id: 'uuid',
 *     name: 'Nombre del proyecto',
 *     description: 'Descripción',
 *     coverImage: 'url-de-imagen',
 *     createdAt: '2024-01-01T00:00:00Z',
 *     updatedAt: '2024-01-01T00:00:00Z'
 *   },
 *   ...
 * ]
 */
export async function getAllProjects() {
  try {
    const projects = await get(API_ENDPOINTS.projects.list)
    return projects
  } catch (error) {
    console.error("[v0] Error fetching projects:", error)
    throw error
  }
}

/**
 * OBTENER UN PROYECTO ESPECÍFICO
 *
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Object>} - Datos del proyecto
 */
export async function getProject(projectId) {
  try {
    const project = await get(API_ENDPOINTS.projects.get(projectId))
    return project
  } catch (error) {
    console.error("[v0] Error fetching project:", error)
    throw error
  }
}

/**
 * CREAR NUEVO PROYECTO
 *
 * @param {Object} projectData - Datos del proyecto
 * @param {string} projectData.name - Nombre del proyecto
 * @param {string} projectData.description - Descripción
 * @param {string} projectData.coverImage - URL de imagen de portada
 * @returns {Promise<Object>} - Proyecto creado
 *
 * EJEMPLO DE IMPLEMENTACIÓN EN BACKEND:
 *
 * exports.createProject = async (req, res) => {
 *   const { name, description, coverImage } = req.body;
 *   const project = await Project.create({
 *     id: uuidv4(),
 *     name,
 *     description,
 *     coverImage,
 *     userId: req.user.id
 *   });
 *   res.status(201).json(project);
 * };
 */
export async function createProject(projectData) {
  try {
    const project = await post(API_ENDPOINTS.projects.create, projectData)
    return project
  } catch (error) {
    console.error("[v0] Error creating project:", error)
    throw error
  }
}

/**
 * ACTUALIZAR PROYECTO
 *
 * @param {string} projectId - ID del proyecto
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} - Proyecto actualizado
 */
export async function updateProject(projectId, updates) {
  try {
    const project = await put(API_ENDPOINTS.projects.update(projectId), updates)
    return project
  } catch (error) {
    console.error("[v0] Error updating project:", error)
    throw error
  }
}

/**
 * ELIMINAR PROYECTO
 *
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Object>} - Confirmación de eliminación
 */
export async function deleteProject(projectId) {
  try {
    const result = await deleteRequest(API_ENDPOINTS.projects.delete(projectId))
    return result
  } catch (error) {
    console.error("[v0] Error deleting project:", error)
    throw error
  }
}

/**
 * REORDENAR PROYECTOS
 *
 * Actualiza el orden de los proyectos
 *
 * @param {Array<string>} projectIds - Array de IDs en el nuevo orden
 * @returns {Promise<Object>} - Confirmación
 *
 * EJEMPLO DE IMPLEMENTACIÓN EN BACKEND:
 *
 * exports.reorderProjects = async (req, res) => {
 *   const { projectIds } = req.body;
 *   await Promise.all(
 *     projectIds.map((id, index) =>
 *       Project.update({ position: index }, { where: { id } })
 *     )
 *   );
 *   res.json({ success: true });
 * };
 */
export async function reorderProjects(projectIds) {
  try {
    const result = await put(API_ENDPOINTS.projects.reorder, { projectIds })
    return result
  } catch (error) {
    console.error("[v0] Error reordering projects:", error)
    throw error
  }
}

/**
 * SUBIR IMAGEN DE PORTADA
 *
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} - URL de la imagen subida
 *
 * EJEMPLO DE IMPLEMENTACIÓN EN BACKEND (con multer):
 *
 * const multer = require('multer');
 * const storage = multer.diskStorage({
 *   destination: './uploads/',
 *   filename: (req, file, cb) => {
 *     cb(null, `${Date.now()}-${file.originalname}`);
 *   }
 * });
 * const upload = multer({ storage });
 *
 * router.post('/upload', upload.single('file'), (req, res) => {
 *   res.json({ url: `/uploads/${req.file.filename}` });
 * });
 */
export async function uploadCoverImage(file) {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await uploadFile(API_ENDPOINTS.upload, formData)
    return `${UPLOAD_URL}/${response.filename}`
  } catch (error) {
    console.error("[v0] Error uploading image:", error)
    throw error
  }
}
