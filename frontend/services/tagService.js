/**
 * SERVICIO DE ETIQUETAS (TAGS/BANDERAS)
 *
 * Maneja operaciones relacionadas con etiquetas/banderas.
 * Las etiquetas se pueden asignar a detalles para categorizarlos.
 *
 * FUNCIONES:
 * - getAllTags: Obtener todas las etiquetas
 * - createTag: Crear nueva etiqueta
 * - updateTag: Actualizar etiqueta
 * - deleteTag: Eliminar etiqueta
 */

import { get, post, put, deleteRequest } from "./api"
import { API_ENDPOINTS } from "../config/api"

/**
 * OBTENER TODAS LAS ETIQUETAS
 *
 * @returns {Promise<Array>} - Array de etiquetas
 *
 * ESTRUCTURA DE UNA ETIQUETA:
 * {
 *   id: 'uuid',
 *   name: 'Costo',
 *   color: '#FFA500',
 *   category: 'financiero',
 *   createdAt: '2024-01-01T00:00:00Z'
 * }
 */
export async function getAllTags() {
  try {
    const tags = await get(API_ENDPOINTS.tags.list)
    return tags
  } catch (error) {
    console.error("[v0] Error fetching tags:", error)
    throw error
  }
}

/**
 * CREAR NUEVA ETIQUETA
 *
 * @param {Object} tagData - Datos de la etiqueta
 * @param {string} tagData.name - Nombre de la etiqueta
 * @param {string} tagData.color - Color en formato hex
 * @param {string} tagData.category - Categoría (opcional)
 * @returns {Promise<Object>} - Etiqueta creada
 */
export async function createTag(tagData) {
  try {
    const tag = await post(API_ENDPOINTS.tags.create, tagData)
    return tag
  } catch (error) {
    console.error("[v0] Error creating tag:", error)
    throw error
  }
}

/**
 * ACTUALIZAR ETIQUETA
 *
 * @param {string} tagId - ID de la etiqueta
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} - Etiqueta actualizada
 */
export async function updateTag(tagId, updates) {
  try {
    const tag = await put(API_ENDPOINTS.tags.update(tagId), updates)
    return tag
  } catch (error) {
    console.error("[v0] Error updating tag:", error)
    throw error
  }
}

/**
 * ELIMINAR ETIQUETA
 *
 * @param {string} tagId - ID de la etiqueta
 * @returns {Promise<Object>} - Confirmación
 */
export async function deleteTag(tagId) {
  try {
    const result = await deleteRequest(API_ENDPOINTS.tags.delete(tagId))
    return result
  } catch (error) {
    console.error("[v0] Error deleting tag:", error)
    throw error
  }
}
