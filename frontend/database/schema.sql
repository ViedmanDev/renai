-- =====================================================
-- ESQUEMA DE BASE DE DATOS PARA SISTEMA DE PROYECTOS
-- =====================================================
-- 
-- Este archivo contiene el esquema completo de la base de datos.
-- Incluye todas las tablas, relaciones, índices y constraints necesarios.
--
-- CÓMO USAR:
-- 1. Crear una base de datos: CREATE DATABASE project_manager;
-- 2. Ejecutar este script en la base de datos
-- 3. Configurar las credenciales en el backend
--
-- MOTOR RECOMENDADO: MySQL 8.0+ o PostgreSQL 12+
-- =====================================================

-- Tabla de usuarios (si no existe ya)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- =====================================================
-- TABLA: projects
-- Almacena información básica de los proyectos
-- =====================================================
CREATE TABLE projects (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image VARCHAR(500),
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_id VARCHAR(36) NOT NULL,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Índices para mejorar performance
  INDEX idx_user_id (user_id),
  INDEX idx_position (position),
  INDEX idx_created_at (created_at)
);

-- =====================================================
-- TABLA: detail_types
-- Define los tipos de detalles disponibles
-- Esta tabla puede ser pre-poblada con tipos estándar
-- =====================================================
CREATE TABLE detail_types (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL UNIQUE,
  has_sub_options BOOLEAN DEFAULT FALSE,
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_type (type)
);

-- Poblar tipos de detalles predefinidos
INSERT INTO detail_types (id, name, type, has_sub_options, icon) VALUES
(UUID(), 'Ruta crítica', 'ruta_critica', FALSE, 'Timeline'),
(UUID(), 'Ponderación', 'ponderacion', FALSE, 'Percent'),
(UUID(), 'Producto', 'producto', FALSE, 'Inventory'),
(UUID(), 'Indicador de producto', 'indicador_producto', FALSE, 'TrendingUp'),
(UUID(), 'Bandera', 'bandera', TRUE, 'Flag'),
(UUID(), 'Texto', 'texto', TRUE, 'TextFields'),
(UUID(), 'Numérico', 'numerico', TRUE, 'Numbers'),
(UUID(), 'Si/No', 'si_no', FALSE, 'ToggleOn'),
(UUID(), 'Fecha', 'fecha', TRUE, 'CalendarToday'),
(UUID(), 'Adjuntos', 'adjuntos', FALSE, 'AttachFile'),
(UUID(), 'Desde Listas', 'desde_listas', FALSE, 'List'),
(UUID(), 'Nota interna', 'nota_interna', FALSE, 'Note');

-- =====================================================
-- TABLA: project_details
-- Almacena los detalles específicos de cada proyecto
-- El campo 'config' es JSON para flexibilidad
-- =====================================================
CREATE TABLE project_details (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  detail_type_id VARCHAR(36) NOT NULL,
  name VARCHAR(255),
  value TEXT,
  sub_type VARCHAR(50),
  config JSON,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (detail_type_id) REFERENCES detail_types(id),
  
  -- Índices
  INDEX idx_project_id (project_id),
  INDEX idx_detail_type_id (detail_type_id),
  INDEX idx_position (position)
);

-- =====================================================
-- TABLA: tags
-- Almacena etiquetas/banderas reutilizables
-- =====================================================
CREATE TABLE tags (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  user_id VARCHAR(36),
  is_global BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_user_id (user_id),
  INDEX idx_category (category),
  INDEX idx_name (name)
);

-- Poblar etiquetas predefinidas globales
INSERT INTO tags (id, name, color, category, is_global) VALUES
(UUID(), 'Costo', '#FFA500', 'financiero', TRUE),
(UUID(), 'Revisar', '#FF9800', 'estado', TRUE),
(UUID(), 'Factibilidad', '#4CAF50', 'evaluacion', TRUE),
(UUID(), 'POAI 2025', '#FF5252', 'planificacion', TRUE),
(UUID(), 'Emprestito', '#FFD700', 'financiero', TRUE),
(UUID(), 'Urgente', '#F44336', 'prioridad', TRUE),
(UUID(), 'Aprobado', '#4CAF50', 'estado', TRUE),
(UUID(), 'Pendiente', '#FFC107', 'estado', TRUE);

-- =====================================================
-- TABLA: detail_tags
-- Relación muchos a muchos entre detalles y etiquetas
-- =====================================================
CREATE TABLE detail_tags (
  detail_id VARCHAR(36),
  tag_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (detail_id, tag_id),
  
  -- Foreign Keys
  FOREIGN KEY (detail_id) REFERENCES project_details(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_detail_id (detail_id),
  INDEX idx_tag_id (tag_id)
);

-- =====================================================
-- TABLA: templates
-- Almacena plantillas reutilizables de proyectos
-- =====================================================
CREATE TABLE templates (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSON NOT NULL,
  user_id VARCHAR(36),
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_user_id (user_id),
  INDEX idx_is_public (is_public),
  INDEX idx_usage_count (usage_count)
);

-- =====================================================
-- TABLA: project_history (OPCIONAL - para auditoría)
-- Registra cambios en proyectos para historial
-- =====================================================
CREATE TABLE project_history (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_project_id (project_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de proyectos con conteo de detalles
CREATE VIEW projects_with_details AS
SELECT 
  p.*,
  COUNT(pd.id) as detail_count
FROM projects p
LEFT JOIN project_details pd ON p.id = pd.project_id
GROUP BY p.id;

-- Vista de detalles con información de tipo
CREATE VIEW details_with_type AS
SELECT 
  pd.*,
  dt.name as type_name,
  dt.icon as type_icon
FROM project_details pd
JOIN detail_types dt ON pd.detail_type_id = dt.id;

-- =====================================================
-- TRIGGERS (OPCIONAL - para mantener integridad)
-- =====================================================

-- Trigger para actualizar updated_at automáticamente
DELIMITER //
CREATE TRIGGER update_project_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_detail_timestamp
BEFORE UPDATE ON project_details
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =====================================================

-- Procedimiento para duplicar un proyecto
DELIMITER //
CREATE PROCEDURE duplicate_project(
  IN original_project_id VARCHAR(36),
  IN new_project_name VARCHAR(255),
  IN user_id VARCHAR(36),
  OUT new_project_id VARCHAR(36)
)
BEGIN
  -- Crear nuevo proyecto
  SET new_project_id = UUID();
  
  INSERT INTO projects (id, name, description, cover_image, user_id)
  SELECT new_project_id, new_project_name, description, cover_image, user_id
  FROM projects
  WHERE id = original_project_id;
  
  -- Copiar detalles
  INSERT INTO project_details (id, project_id, detail_type_id, name, value, sub_type, config, position)
  SELECT UUID(), new_project_id, detail_type_id, name, value, sub_type, config, position
  FROM project_details
  WHERE project_id = original_project_id;
END//
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX idx_project_user_created ON projects(user_id, created_at DESC);
CREATE INDEX idx_detail_project_position ON project_details(project_id, position);

-- =====================================================
-- COMENTARIOS EN TABLAS (para documentación)
-- =====================================================

ALTER TABLE projects COMMENT = 'Tabla principal de proyectos del usuario';
ALTER TABLE project_details COMMENT = 'Detalles configurables de cada proyecto';
ALTER TABLE detail_types COMMENT = 'Tipos de detalles disponibles en el sistema';
ALTER TABLE tags COMMENT = 'Etiquetas/banderas reutilizables para categorización';
ALTER TABLE templates COMMENT = 'Plantillas guardadas para crear proyectos rápidamente';

-- =====================================================
-- TABLA: project_tasks
-- Agregar gestión de tareas por proyecto
-- Almacena tareas asociadas a cada proyecto
-- =====================================================
CREATE TABLE IF NOT EXISTS project_tasks (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_project_tasks_project (project_id),
  INDEX idx_project_tasks_status (status),
  INDEX idx_project_tasks_priority (priority),
  INDEX idx_project_tasks_due_date (due_date)
) COMMENT = 'Tareas asociadas a proyectos con prioridades y fechas';

-- =====================================================
-- TABLA: custom_parameters
-- Agregar parámetros personalizados del sistema
-- Permite crear campos dinámicos configurables
-- =====================================================
CREATE TABLE IF NOT EXISTS custom_parameters (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('text', 'number', 'boolean', 'date', 'select') NOT NULL,
  default_value TEXT,
  description TEXT,
  options JSON, -- Para tipo 'select', almacena array de opciones
  user_id VARCHAR(36),
  is_global BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_custom_parameters_type (type),
  INDEX idx_custom_parameters_user (user_id),
  INDEX idx_custom_parameters_global (is_global)
) COMMENT = 'Parámetros personalizados configurables por usuario';

-- =====================================================
-- TABLA: project_parameter_values
-- Valores de parámetros personalizados por proyecto
-- Relación entre proyectos y sus valores de parámetros
-- =====================================================
CREATE TABLE IF NOT EXISTS project_parameter_values (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  parameter_id VARCHAR(36) NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (parameter_id) REFERENCES custom_parameters(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_project_param_project (project_id),
  INDEX idx_project_param_parameter (parameter_id),
  
  -- Constraint único para evitar duplicados
  UNIQUE KEY unique_project_parameter (project_id, parameter_id)
) COMMENT = 'Valores de parámetros personalizados asignados a proyectos';
