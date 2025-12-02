/**
 * CONFIGURACIÓN DE API
 *
 * Este archivo centraliza toda la configuración relacionada con las llamadas a la API.
 * Facilita el cambio de URLs y configuraciones sin modificar múltiples archivos.
 *
 * CÓMO USAR:
 * import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
 *
 * CÓMO CONECTAR CON BACKEND:
 * 1. Asegúrate de que el backend esté corriendo en el puerto especificado
 * 2. Configura CORS en el backend para permitir requests desde el frontend
 * 3. Actualiza la variable de entorno REACT_APP_API_URL si es necesario
 */

// URL base de la API - Se obtiene de variables de entorno
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// URL para archivos subidos
export const UPLOAD_URL =
  process.env.REACT_APP_UPLOAD_URL || "http://localhost:5000/uploads";

/**
 * ENDPOINTS DE LA API
 * Centraliza todas las rutas de la API para fácil mantenimiento
 */
export const API_ENDPOINTS = {
  // Endpoints de Proyectos
  projects: {
    list: "/projects", // GET - Listar todos los proyectos
    create: "/projects", // POST - Crear nuevo proyecto
    get: (id) => `/projects/${id}`, // GET - Obtener proyecto específico
    update: (id) => `/projects/${id}`, // PUT - Actualizar proyecto
    delete: (id) => `/projects/${id}`, // DELETE - Eliminar proyecto
    reorder: "/projects/reorder", // PUT - Reordenar proyectos
  },

  // Endpoints de Detalles
  details: {
    list: (projectId) => `/projects/${projectId}/details`, // GET - Listar detalles de un proyecto
    create: (projectId) => `/projects/${projectId}/details`, // POST - Crear detalle
    update: (id) => `/details/${id}`, // PUT - Actualizar detalle
    delete: (id) => `/details/${id}`, // DELETE - Eliminar detalle
    reorder: (projectId) => `/projects/${projectId}/details/reorder`, // PUT - Reordenar detalles
  },

  // Endpoints de Etiquetas (Tags/Banderas)
  tags: {
    list: "/tags", // GET - Listar todas las etiquetas
    create: "/tags", // POST - Crear nueva etiqueta
    update: (id) => `/tags/${id}`, // PUT - Actualizar etiqueta
    delete: (id) => `/tags/${id}`, // DELETE - Eliminar etiqueta
  },

  // Endpoints de Plantillas
  templates: {
    list: "/templates", // GET - Listar plantillas
    create: "/templates", // POST - Crear plantilla
    get: (id) => `/templates/${id}`, // GET - Obtener plantilla específica
    apply: (id) => `/templates/${id}/apply`, // POST - Aplicar plantilla a proyecto
    delete: (id) => `/templates/${id}`, // DELETE - Eliminar plantilla
  },

  // Endpoint de Upload
  upload: "/upload", // POST - Subir archivos (imágenes)
};

/**
 * CONFIGURACIÓN DE HEADERS
 * Headers por defecto para todas las requests
 */
export const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  // Si hay token de autenticación, agregarlo
  const token = localStorage.getItem("authToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * CONFIGURACIÓN DE HEADERS PARA MULTIPART (archivos)
 */
export const getMultipartHeaders = () => {
  const headers = {};

  // No establecer Content-Type para multipart, el navegador lo hace automáticamente
  const token = localStorage.getItem("authToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * TIMEOUT DE REQUESTS
 * Tiempo máximo de espera para una request (en milisegundos)
 */
export const REQUEST_TIMEOUT = 30000; // 30 segundos

/**
 * CONFIGURACIÓN DE RETRY
 * Configuración para reintentar requests fallidas
 */
export const RETRY_CONFIG = {
  maxRetries: 3, // Número máximo de reintentos
  retryDelay: 1000, // Delay entre reintentos (ms)
  retryOn: [408, 500, 502, 503, 504], // Códigos de error que activan retry
};
