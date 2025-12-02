/**
 * SERVICIO BASE DE API
 *
 * Este archivo contiene funciones helper para hacer requests HTTP.
 * Maneja errores, timeouts, y retry logic de manera centralizada.
 *
 * FUNCIONES PRINCIPALES:
 * - apiRequest: Función genérica para hacer requests
 * - get, post, put, delete: Wrappers específicos por método HTTP
 *
 * CÓMO USAR:
 * import { get, post, put, deleteRequest } from '../services/api';
 * const data = await get('/projects');
 */

import { API_BASE_URL, getHeaders, getMultipartHeaders, REQUEST_TIMEOUT, RETRY_CONFIG } from "../config/api"

/**
 * Clase para errores de API personalizados
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

/**
 * FUNCIÓN PRINCIPAL DE REQUEST
 *
 * Hace una request HTTP con manejo de errores, timeout y retry logic
 *
 * @param {string} endpoint - Endpoint relativo (ej: '/projects')
 * @param {object} options - Opciones de fetch (method, body, headers, etc.)
 * @param {number} retryCount - Contador interno de reintentos
 * @returns {Promise} - Promesa con los datos de respuesta
 */
async function apiRequest(endpoint, options = {}, retryCount = 0) {
  const url = `${API_BASE_URL}${endpoint}`

  // Configurar timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    console.log("[v0] API Request:", options.method || "GET", url)

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: options.headers || getHeaders(),
    })

    clearTimeout(timeoutId)

    // Parsear respuesta
    const contentType = response.headers.get("content-type")
    let data

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    // Manejar errores HTTP
    if (!response.ok) {
      console.error("[v0] API Error:", response.status, data)

      // Verificar si debemos reintentar
      if (retryCount < RETRY_CONFIG.maxRetries && RETRY_CONFIG.retryOn.includes(response.status)) {
        console.log(`[v0] Retrying request (${retryCount + 1}/${RETRY_CONFIG.maxRetries})...`)
        await new Promise((resolve) => setTimeout(resolve, RETRY_CONFIG.retryDelay))
        return apiRequest(endpoint, options, retryCount + 1)
      }

      throw new ApiError(data.message || "Error en la solicitud", response.status, data)
    }

    console.log("[v0] API Response:", data)
    return data
  } catch (error) {
    clearTimeout(timeoutId)

    // Manejar timeout
    if (error.name === "AbortError") {
      console.error("[v0] Request timeout")
      throw new ApiError("La solicitud tardó demasiado tiempo", 408, null)
    }

    // Manejar errores de red
    if (error instanceof TypeError) {
      console.error("[v0] Network error:", error)
      throw new ApiError("Error de conexión. Verifica tu internet.", 0, null)
    }

    // Re-lanzar otros errores
    throw error
  }
}

/**
 * GET REQUEST
 *
 * @param {string} endpoint - Endpoint relativo
 * @param {object} params - Query parameters (opcional)
 * @returns {Promise} - Datos de respuesta
 */
export async function get(endpoint, params = {}) {
  // Construir query string
  const queryString = Object.keys(params).length > 0 ? "?" + new URLSearchParams(params).toString() : ""

  return apiRequest(endpoint + queryString, {
    method: "GET",
  })
}

/**
 * POST REQUEST
 *
 * @param {string} endpoint - Endpoint relativo
 * @param {object} data - Datos a enviar en el body
 * @returns {Promise} - Datos de respuesta
 */
export async function post(endpoint, data) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * PUT REQUEST
 *
 * @param {string} endpoint - Endpoint relativo
 * @param {object} data - Datos a actualizar
 * @returns {Promise} - Datos de respuesta
 */
export async function put(endpoint, data) {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/**
 * DELETE REQUEST
 *
 * @param {string} endpoint - Endpoint relativo
 * @returns {Promise} - Datos de respuesta
 */
export async function deleteRequest(endpoint) {
  return apiRequest(endpoint, {
    method: "DELETE",
  })
}

/**
 * UPLOAD FILE REQUEST
 *
 * Sube un archivo al servidor
 *
 * @param {string} endpoint - Endpoint relativo
 * @param {FormData} formData - FormData con el archivo
 * @returns {Promise} - Datos de respuesta (URL del archivo)
 */
export async function uploadFile(endpoint, formData) {
  return apiRequest(endpoint, {
    method: "POST",
    body: formData,
    headers: getMultipartHeaders(),
  })
}
