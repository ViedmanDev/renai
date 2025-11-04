/**
 * SCRIPT DE INICIALIZACIÓN DE MONGODB
 *
 * Crea datos de ejemplo para probar la aplicación
 * Ejecutar con: node scripts/init-mongodb.js
 */

const mongoose = require("mongoose")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/project_manager"

// Esquemas simplificados para el script
const UserSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
    name: String,
  },
  { timestamps: true },
)

const TagSchema = new mongoose.Schema(
  {
    name: String,
    color: String,
    category: String,
    isGlobal: Boolean,
  },
  { timestamps: true },
)

const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    coverImage: String,
    position: Number,
    userId: mongoose.Schema.Types.ObjectId,
    details: [
      {
        detailTypeId: String,
        name: String,
        value: mongoose.Schema.Types.Mixed,
        subType: String,
        config: mongoose.Schema.Types.Mixed,
        position: Number,
      },
    ],
  },
  { timestamps: true },
)

const User = mongoose.model("User", UserSchema)
const Tag = mongoose.model("Tag", TagSchema)
const Project = mongoose.model("Project", ProjectSchema)

async function initDatabase() {
  try {
    console.log("Conectando a MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("✓ Conectado a MongoDB")

    // Limpiar datos existentes
    console.log("\nLimpiando datos existentes...")
    await User.deleteMany({})
    await Tag.deleteMany({})
    await Project.deleteMany({})
    console.log("✓ Datos limpiados")

    // Crear usuario de ejemplo
    console.log("\nCreando usuario de ejemplo...")
    const user = await User.create({
      email: "demo@example.com",
      password: "demo123",
      name: "Usuario Demo",
    })
    console.log("✓ Usuario creado:", user.email)

    // Crear etiquetas globales
    console.log("\nCreando etiquetas globales...")
    const tags = await Tag.insertMany([
      { name: "Costo", color: "#FFA500", category: "financiero", isGlobal: true },
      { name: "Revisar", color: "#FF9800", category: "estado", isGlobal: true },
      { name: "Factibilidad", color: "#4CAF50", category: "evaluacion", isGlobal: true },
      { name: "POAI 2025", color: "#FF5252", category: "planificacion", isGlobal: true },
      { name: "Emprestito", color: "#FFD700", category: "financiero", isGlobal: true },
      { name: "Urgente", color: "#F44336", category: "prioridad", isGlobal: true },
      { name: "Aprobado", color: "#4CAF50", category: "estado", isGlobal: true },
      { name: "Pendiente", color: "#FFC107", category: "estado", isGlobal: true },
    ])
    console.log(`✓ ${tags.length} etiquetas creadas`)

    // Crear proyectos de ejemplo
    console.log("\nCreando proyectos de ejemplo...")
    const projects = await Project.insertMany([
      {
        name: "Proyecto Demo 1",
        description: "Este es un proyecto de demostración con MongoDB",
        position: 0,
        userId: user._id,
        details: [
          {
            detailTypeId: "texto",
            name: "Descripción",
            value: "Proyecto de ejemplo para demostrar MongoDB",
            subType: "texto_corto",
            config: {},
            position: 0,
          },
          {
            detailTypeId: "numerico",
            name: "Presupuesto",
            value: 50000,
            subType: "moneda",
            config: { decimals: 2, symbol: "$" },
            position: 1,
          },
          {
            detailTypeId: "fecha",
            name: "Fecha de inicio",
            value: new Date("2025-01-01"),
            subType: "fecha_unica",
            config: { dateType: "single" },
            position: 2,
          },
        ],
      },
      {
        name: "Proyecto Demo 2",
        description: "Segundo proyecto de ejemplo",
        position: 1,
        userId: user._id,
        details: [
          {
            detailTypeId: "texto",
            name: "Cliente",
            value: "Empresa XYZ",
            subType: "texto_corto",
            config: {},
            position: 0,
          },
          {
            detailTypeId: "si_no",
            name: "Aprobado",
            value: true,
            subType: "booleano",
            config: {},
            position: 1,
          },
        ],
      },
      {
        name: "Proyecto Demo 3",
        description: "Tercer proyecto sin detalles",
        position: 2,
        userId: user._id,
        details: [],
      },
    ])
    console.log(`✓ ${projects.length} proyectos creados`)

    console.log("\n✅ Base de datos inicializada exitosamente!")
    console.log("\nCredenciales de prueba:")
    console.log("Email: demo@example.com")
    console.log("Password: demo123")
    console.log(`\nProyectos creados: ${projects.length}`)
    console.log(`Etiquetas disponibles: ${tags.length}`)
  } catch (error) {
    console.error("❌ Error al inicializar la base de datos:", error)
  } finally {
    await mongoose.connection.close()
    console.log("\n✓ Conexión cerrada")
  }
}

// Ejecutar inicialización
initDatabase()
