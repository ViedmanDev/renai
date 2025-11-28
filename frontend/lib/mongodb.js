/**
 * CONEXIÓN A MONGODB
 *
 * Maneja la conexión a MongoDB usando Mongoose
 * Implementa patrón singleton para reutilizar conexión
 *
 * COMPATIBILIDAD:
 * - Mongoose para modelos y schemas
 * - Acceso directo a la DB nativa de MongoDB para operaciones directas
 */

import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/project_manager";

if (!MONGODB_URI) {
  throw new Error("Por favor define la variable MONGODB_URI en .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Conecta a MongoDB usando Mongoose
 * Retorna el objeto de conexión de Mongoose
 */
async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB conectado exitosamente");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ Error conectando a MongoDB:", e);
    throw e;
  }

  return cached.conn;
}

/**
 * Obtiene la instancia nativa de la base de datos de MongoDB
 * Útil para operaciones directas sin usar modelos de Mongoose
 *
 * IMPORTANTE: Esta función devuelve la DB nativa para usar con colecciones
 * directamente (como 'banderas'), sin necesidad de definir un modelo Mongoose
 *
 * Ejemplo de uso:
 * const db = await getDB();
 * const tags = await db.collection('banderas').find({}).toArray();
 */
export async function getDB() {
  await connectDB();
  return mongoose.connection.db;
}

/**
 * Exportación por defecto mantiene compatibilidad con código existente
 */
export default connectDB;
