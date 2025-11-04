/**
 * SERVICIO DE DETALLES
 *
 * Maneja todas las operaciones relacionadas con los detalles de proyectos.
 *
 * FUNCIONES:
 * - getProjectDetails: Obtener detalles de un proyecto
 * - createDetail: Crear nuevo detalle
 * - updateDetail: Actualizar detalle existente
 * - deleteDetail: Eliminar detalle
 * - reorderDetails: Cambiar orden de detalles
 *
 * ESTRUCTURA DE UN DETALLE:
 * {
 *   id: 'uuid',
 *   projectId: 'uuid',
 *   detailTypeId: 'uuid',
 *   name: 'Nombre del detalle',
 *   value: 'Valor (puede ser string, number, JSON)',
 *   subType: 'texto_corto' | 'numero' | 'fecha_unica' | etc.,
 *   config: {
 *     decimals: 2,
 *     dateType: 'single',
 *     tags: ['tag1', 'tag2'],
 *     // ... otras configuraciones específicas del tipo
 *   },
 *   position: 0,
 *   createdAt: '2024-01-01T00:00:00Z'
 * }
 */

import { get, post, put, deleteRequest } from "./api"
import { API_ENDPOINTS } from "../config/api"

/**
 * OBTENER DETALLES DE UN PROYECTO
 *
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Array>} - Array de detalles
 */
export async function getProjectDetails(projectId) {
  try {
    const details = await get(API_ENDPOINTS.details.list(projectId))
    return details
  } catch (error) {
    console.error("[v0] Error fetching details:", error)
    throw error
  }
}

/**
 * CREAR NUEVO DETALLE
 *
 * @param {string} projectId - ID del proyecto
 * @param {Object} detailData - Datos del detalle
 * @returns {Promise<Object>} - Detalle creado
 *
 * EJEMPLO DE IMPLEMENTACIÓN EN BACKEND:
 *
 * exports.createDetail = async (req, res) => {
 *   const { projectId } = req.params;
 *   const { detailTypeId, name, value, subType, config } = req.body;
 *
 *   // Validar que el proyecto existe y pertenece al usuario
 *   const project = await Project.findOne({
 *     where: { id: projectId, userId: req.user.id }
 *   });
 *   if (!project) return res.status(404).json({ message: 'Proyecto no encontrado' });
 *
 *   // Obtener la posición máxima actual
 *   const maxPosition = await ProjectDetail.max('position', {
 *     where: { projectId }
 *   }) || 0;
 *
 *   const detail = await ProjectDetail.create({
 *     id: uuidv4(),
 *     projectId,
 *     detailTypeId,
 *     name,
 *     value,
 *     subType,
 *     config: JSON.stringify(config),
 *     position: maxPosition + 1
 *   });
 *
 *   res.status(201).json(detail);
 * };
 */
export async function createDetail(projectId, detailData) {
  try {
    const detail = await post(API_ENDPOINTS.details.create(projectId), detailData)
    return detail
  } catch (error) {
    console.error("[v0] Error creating detail:", error)
    throw error
  }
}

/**
 * ACTUALIZAR DETALLE
 *
 * @param {string} detailId - ID del detalle
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} - Detalle actualizado
 */
export async function updateDetail(detailId, updates) {
  try {
    const detail = await put(API_ENDPOINTS.details.update(detailId), updates)
    return detail
  } catch (error) {
    console.error("[v0] Error updating detail:", error)
    throw error
  }
}

/**
 * ELIMINAR DETALLE
 *
 * @param {string} detailId - ID del detalle
 * @returns {Promise<Object>} - Confirmación
 */
export async function deleteDetail(detailId) {
  try {
    const result = await deleteRequest(API_ENDPOINTS.details.delete(detailId))
    return result
  } catch (error) {
    console.error("[v0] Error deleting detail:", error)
    throw error
  }
}

/**
 * REORDENAR DETALLES
 *
 * @param {string} projectId - ID del proyecto
 * @param {Array<string>} detailIds - Array de IDs en el nuevo orden
 * @returns {Promise<Object>} - Confirmación
 */
export async function reorderDetails(projectId, detailIds) {
  try {
    const result = await put(API_ENDPOINTS.details.reorder(projectId), { detailIds })
    return result
  } catch (error) {
    console.error("[v0] Error reordering details:", error)
    throw error
  }
}
