/**
 * SERVICIO DE PLANTILLAS
 *
 * Maneja operaciones relacionadas con plantillas reutilizables.
 * Las plantillas permiten guardar configuraciones de proyectos para reutilizarlas.
 *
 * FUNCIONES:
 * - getAllTemplates: Obtener lista de plantillas
 * - getTemplate: Obtener plantilla específica
 * - createTemplate: Crear nueva plantilla desde un proyecto
 * - applyTemplate: Aplicar plantilla a un proyecto nuevo
 * - deleteTemplate: Eliminar plantilla
 */

import { get, post, deleteRequest } from "./api"
import { API_ENDPOINTS } from "../config/api"

/**
 * OBTENER TODAS LAS PLANTILLAS
 *
 * @returns {Promise<Array>} - Array de plantillas
 *
 * ESTRUCTURA DE UNA PLANTILLA:
 * {
 *   id: 'uuid',
 *   name: 'Nombre de la plantilla',
 *   description: 'Descripción',
 *   config: {
 *     details: [...], // Configuración de detalles
 *     settings: {...} // Otras configuraciones
 *   },
 *   isPublic: false,
 *   createdAt: '2024-01-01T00:00:00Z'
 * }
 */
export async function getAllTemplates() {
  try {
    const templates = await get(API_ENDPOINTS.templates.list)
    return templates
  } catch (error) {
    console.error("[v0] Error fetching templates:", error)
    throw error
  }
}

/**
 * OBTENER PLANTILLA ESPECÍFICA
 *
 * @param {string} templateId - ID de la plantilla
 * @returns {Promise<Object>} - Datos de la plantilla
 */
export async function getTemplate(templateId) {
  try {
    const template = await get(API_ENDPOINTS.templates.get(templateId))
    return template
  } catch (error) {
    console.error("[v0] Error fetching template:", error)
    throw error
  }
}

/**
 * CREAR PLANTILLA DESDE PROYECTO
 *
 * Guarda la configuración actual de un proyecto como plantilla reutilizable
 *
 * @param {Object} templateData - Datos de la plantilla
 * @param {string} templateData.name - Nombre de la plantilla
 * @param {string} templateData.description - Descripción
 * @param {Object} templateData.config - Configuración (detalles, etc.)
 * @param {boolean} templateData.isPublic - Si es pública o privada
 * @returns {Promise<Object>} - Plantilla creada
 *
 * EJEMPLO DE USO:
 *
 * const template = await createTemplate({
 *   name: 'Plantilla de Proyecto Básico',
 *   description: 'Incluye campos comunes para proyectos',
 *   config: {
 *     details: project.details.map(d => ({
 *       type: d.type,
 *       subType: d.subType,
 *       config: d.config
 *     }))
 *   },
 *   isPublic: false
 * });
 */
export async function createTemplate(templateData) {
  try {
    const template = await post(API_ENDPOINTS.templates.create, templateData)
    return template
  } catch (error) {
    console.error("[v0] Error creating template:", error)
    throw error
  }
}

/**
 * APLICAR PLANTILLA A PROYECTO
 *
 * Crea un nuevo proyecto basado en una plantilla
 *
 * @param {string} templateId - ID de la plantilla
 * @param {Object} projectData - Datos del nuevo proyecto
 * @param {string} projectData.name - Nombre del proyecto
 * @param {string} projectData.description - Descripción
 * @returns {Promise<Object>} - Proyecto creado con la configuración de la plantilla
 *
 * EJEMPLO DE IMPLEMENTACIÓN EN BACKEND:
 *
 * exports.applyTemplate = async (req, res) => {
 *   const { templateId } = req.params;
 *   const { name, description } = req.body;
 *
 *   // Obtener plantilla
 *   const template = await Template.findByPk(templateId);
 *   if (!template) return res.status(404).json({ message: 'Plantilla no encontrada' });
 *
 *   // Crear proyecto
 *   const project = await Project.create({
 *     id: uuidv4(),
 *     name,
 *     description,
 *     userId: req.user.id
 *   });
 *
 *   // Crear detalles desde la plantilla
 *   const config = JSON.parse(template.config);
 *   await Promise.all(
 *     config.details.map((detail, index) =>
 *       ProjectDetail.create({
 *         id: uuidv4(),
 *         projectId: project.id,
 *         ...detail,
 *         position: index
 *       })
 *     )
 *   );
 *
 *   res.status(201).json(project);
 * };
 */
export async function applyTemplate(templateId, projectData) {
  try {
    const project = await post(API_ENDPOINTS.templates.apply(templateId), projectData)
    return project
  } catch (error) {
    console.error("[v0] Error applying template:", error)
    throw error
  }
}

/**
 * ELIMINAR PLANTILLA
 *
 * @param {string} templateId - ID de la plantilla
 * @returns {Promise<Object>} - Confirmación
 */
export async function deleteTemplate(templateId) {
  try {
    const result = await deleteRequest(API_ENDPOINTS.templates.delete(templateId))
    return result
  } catch (error) {
    console.error("[v0] Error deleting template:", error)
    throw error
  }
}
