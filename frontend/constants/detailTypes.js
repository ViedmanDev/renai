/**
 * ARCHIVO: constants/detailTypes.js
 * PROPÓSITO: Define todos los tipos de detalles disponibles en el sistema, banderas predefinidas y listas
 *
 * ESTRUCTURA DE BASE DE DATOS RECOMENDADA:
 *
 * Tabla: detail_types
 * - id (VARCHAR PRIMARY KEY)
 * - name (VARCHAR)
 * - has_sub_options (BOOLEAN)
 * - sub_options_type (VARCHAR NULLABLE)
 * - icon (VARCHAR)
 * - created_at (TIMESTAMP)
 * - updated_at (TIMESTAMP)
 *
 * Tabla: detail_sub_options
 * - id (VARCHAR PRIMARY KEY)
 * - detail_type_id (VARCHAR FOREIGN KEY -> detail_types.id)
 * - name (VARCHAR)
 * - order_index (INTEGER)
 *
 * Tabla: flags (banderas)
 * - id (VARCHAR PRIMARY KEY)
 * - name (VARCHAR)
 * - color (VARCHAR)
 * - created_at (TIMESTAMP)
 *
 * Tabla: lists
 * - id (VARCHAR PRIMARY KEY)
 * - name (VARCHAR)
 * - type (VARCHAR) // 'organismos', 'entidades', etc.
 * - created_at (TIMESTAMP)
 *
 * CÓMO AGREGAR NUEVOS TIPOS DE DETALLES:
 * 1. Agregar nueva entrada en DETAIL_TYPES con estructura:
 *    {
 *      id: "identificador_unico",
 *      name: "Nombre visible",
 *      hasSubOptions: true/false,
 *      subOptionsType: "field" | "numeric" | "list" | "date" (si hasSubOptions es true),
 *      subOptions: [...] (array de opciones si aplica),
 *      icon: "emoji o icono",
 *      requiresValue: true/false (si necesita valor inicial),
 *      valueType: "number" | "text" | "date" (tipo de valor que acepta)
 *    }
 * 2. Si tiene subOptions, definir el array con { id, name }
 * 3. Actualizar SubOptionsModal.jsx para manejar el nuevo tipo si requiere UI especial
 */

export const DETAIL_TYPES = {
  RUTA_CRITICA: {
    id: "ruta_critica",
    name: "Ruta crítica",
    hasSubOptions: false,
    icon: "🎯",
    requiresValue: false,
  },
  PONDERACION: {
    id: "ponderacion",
    name: "Ponderación",
    hasSubOptions: false,
    icon: "⚖️",
    requiresValue: true,
    valueType: "number",
  },
  PRODUCTO: {
    id: "producto",
    name: "Producto",
    hasSubOptions: false,
    icon: "📦",
    requiresValue: false,
  },
  INDICADOR_PRODUCTO: {
    id: "indicador_producto",
    name: "Indicador de producto",
    hasSubOptions: false,
    icon: "📊",
    requiresValue: false,
  },
  // a la espera de correccion en el frontend
  /*
  BANDERA: {
    id: "bandera",
    name: "Bandera",
    hasSubOptions: true,
    subOptionsType: "list",
    icon: "🚩",
    requiresValue: false,
  },
  */
  TEXTO: {
    id: "texto",
    name: "Texto",
    hasSubOptions: false,
    icon: "📝",
    requiresValue: false,
  },
  CAMPO: {
    id: "campo",
    name: "Campo",
    hasSubOptions: true,
    subOptionsType: "field",
    subOptions: [
      { id: "texto_corto", name: "Texto corto", maxLength: 100 },
      { id: "texto_largo", name: "Texto largo", maxLength: 1000 },
    ],
    icon: "📄",
    requiresValue: false,
  },
  NUMERICO: {
    id: "numerico",
    name: "Numérico",
    hasSubOptions: true,
    subOptionsType: "numeric",
    subOptions: [
      { id: "porcentaje", name: "Porcentaje", symbol: "%", min: 0, max: 100 },
      { id: "numero", name: "Número", symbol: "", min: null, max: null },
      { id: "dolar", name: "$", symbol: "$", min: 0, max: null },
      { id: "usd", name: "USD", symbol: "USD", min: 0, max: null },
      { id: "cop", name: "COP", symbol: "COP", min: 0, max: null },
    ],
    icon: "🔢",
    requiresValue: true,
    valueType: "number",
  },
  SI_NO: {
    id: "si_no",
    name: "Si/No",
    hasSubOptions: false,
    icon: "✓✗",
    requiresValue: false,
  },
  FECHA: {
    id: "fecha",
    name: "Fecha",
    hasSubOptions: true,
    subOptionsType: "date",
    subOptions: [
      { id: "fecha_unica", name: "Fecha única" },
      { id: "rango_fechas", name: "Rango de fechas (Inicio - Fin)" },
    ],
    icon: "📅",
    requiresValue: true,
    valueType: "date",
  },
  // a la espera de correccion en el frontend
  /*
  ADJUNTOS: {
    id: "adjuntos",
    name: "Adjuntos",
    hasSubOptions: false,
    icon: "📎",
    requiresValue: false,
  },
  */
  // a la espera de correccion en el frontend
  /*
  DESDE_LISTAS: {
    id: "desde_listas",
    name: "Desde Listas",
    hasSubOptions: true,
    subOptionsType: "list",
    icon: "📋",
    requiresValue: false,
  },
  */
  NOTA_INTERNA: {
    id: "nota_interna",
    name: "Nota interna",
    hasSubOptions: false,
    icon: "📌",
    requiresValue: false,
  },
  VALOR_COTIZACION: {
    id: "valor_cotizacion",
    name: "Valor cotización",
    hasSubOptions: false,
    icon: "💰",
    requiresValue: true,
    valueType: "number",
    isSpecial: true,
  },
  VALOR_VENTA: {
    id: "valor_venta",
    name: "Valor venta",
    hasSubOptions: false,
    icon: "💵",
    requiresValue: true,
    valueType: "number",
    isSpecial: true,
  },
};

/**
 * Banderas predefinidas del sistema
 * CONEXIÓN A BD: Tabla 'flags'
 * Para agregar nuevas banderas:
 * 1. Agregar aquí para desarrollo
 * 2. Insertar en BD: INSERT INTO flags (id, name, color) VALUES (...)
 * 3. Actualizar el frontend para obtener desde API
 */
export const PREDEFINED_FLAGS = [
  { id: "costo", name: "Costo", color: "#f59e0b" },
  { id: "revisar", name: "Revisar", color: "#f59e0b" },
  { id: "factibilidad", name: "Factibilidad", color: "#10b981" },
  { id: "poai_2025", name: "POAI 2025", color: "#ef4444" },
  { id: "emprestito", name: "Emprestito", color: "#f59e0b" },
];

/**
 * Listas predefinidas del sistema
 * CONEXIÓN A BD: Tabla 'lists'
 * Para agregar nuevas listas:
 * 1. Crear nueva categoría en el objeto
 * 2. Insertar en BD: INSERT INTO lists (id, name, type) VALUES (...)
 * 3. Crear endpoint API: GET /api/lists/:type
 */
export const PREDEFINED_LISTS = {
  organismos: [
    { id: "org1", name: "Organismo 1" },
    { id: "org2", name: "Organismo 2" },
  ],
  entidades: [
    { id: "ent1", name: "Entidad 1" },
    { id: "ent2", name: "Entidad 2" },
  ],
};
