/**
 * SCRIPT PARA AGREGAR MÁS DATOS DE EJEMPLO
 *
 * Ejecutar con: node scripts/seed-data.js
 * Agrega proyectos adicionales con diferentes configuraciones
 */

const mongoose = require("mongoose")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/project_manager"

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

const Project = mongoose.model("Project", ProjectSchema)

async function seedData() {
  try {
    console.log("Conectando a MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("✓ Conectado")

    // Obtener el primer usuario (creado por init-mongodb.js)
    const User = mongoose.model("User", new mongoose.Schema({ email: String }))
    const user = await User.findOne()

    if (!user) {
      console.log("❌ No se encontró usuario. Ejecuta primero: node scripts/init-mongodb.js")
      return
    }

    console.log("\nAgregando proyectos adicionales...")

    const newProjects = [
      {
        name: "Desarrollo de App Móvil",
        description: "Aplicación móvil para gestión de inventario",
        position: 3,
        userId: user._id,
        details: [
          {
            detailTypeId: "texto",
            name: "Cliente",
            value: "TechCorp SA",
            subType: "texto_corto",
            config: {},
            position: 0,
          },
          {
            detailTypeId: "numerico",
            name: "Presupuesto",
            value: 150000,
            subType: "moneda",
            config: { decimals: 2, symbol: "$" },
            position: 1,
          },
          {
            detailTypeId: "fecha",
            name: "Plazo de entrega",
            value: { startDate: new Date("2025-02-01"), endDate: new Date("2025-06-30") },
            subType: "rango",
            config: { dateType: "range" },
            position: 2,
          },
          {
            detailTypeId: "si_no",
            name: "Requiere backend",
            value: true,
            subType: "booleano",
            config: {},
            position: 3,
          },
        ],
      },
      {
        name: "Campaña de Marketing Digital",
        description: "Campaña en redes sociales para lanzamiento de producto",
        position: 4,
        userId: user._id,
        details: [
          {
            detailTypeId: "texto",
            name: "Objetivo",
            value: "Aumentar ventas en 30% durante Q1 2025",
            subType: "texto_largo",
            config: {},
            position: 0,
          },
          {
            detailTypeId: "numerico",
            name: "Inversión publicitaria",
            value: 25000,
            subType: "moneda",
            config: { decimals: 2, symbol: "$" },
            position: 1,
          },
          {
            detailTypeId: "ponderacion",
            name: "Progreso",
            value: 45,
            subType: "porcentaje",
            config: {},
            position: 2,
          },
        ],
      },
      {
        name: "Renovación de Oficinas",
        description: "Proyecto de remodelación del espacio de trabajo",
        position: 5,
        userId: user._id,
        details: [
          {
            detailTypeId: "texto",
            name: "Ubicación",
            value: "Piso 3, Edificio Central",
            subType: "texto_corto",
            config: {},
            position: 0,
          },
          {
            detailTypeId: "numerico",
            name: "Área total",
            value: 350,
            subType: "numero",
            config: { decimals: 0, unit: "m²" },
            position: 1,
          },
          {
            detailTypeId: "fecha",
            name: "Fecha de inicio",
            value: new Date("2025-03-15"),
            subType: "fecha_unica",
            config: { dateType: "single" },
            position: 2,
          },
          {
            detailTypeId: "nota_interna",
            name: "Notas",
            value: "Coordinar con el equipo de TI para el cableado de red",
            subType: "nota",
            config: {},
            position: 3,
          },
        ],
      },
      {
        name: "Implementación de CRM",
        description: "Sistema de gestión de relaciones con clientes",
        position: 6,
        userId: user._id,
        details: [
          {
            detailTypeId: "producto",
            name: "Software",
            value: "Salesforce Enterprise",
            subType: "producto",
            config: {},
            position: 0,
          },
          {
            detailTypeId: "numerico",
            name: "Usuarios",
            value: 50,
            subType: "numero",
            config: { decimals: 0 },
            position: 1,
          },
          {
            detailTypeId: "numerico",
            name: "Costo mensual",
            value: 7500,
            subType: "moneda",
            config: { decimals: 2, symbol: "$" },
            position: 2,
          },
          {
            detailTypeId: "si_no",
            name: "Capacitación incluida",
            value: true,
            subType: "booleano",
            config: {},
            position: 3,
          },
        ],
      },
      {
        name: "Auditoría de Seguridad",
        description: "Revisión completa de la infraestructura de seguridad",
        position: 7,
        userId: user._id,
        details: [
          {
            detailTypeId: "texto",
            name: "Empresa auditora",
            value: "SecureIT Consultores",
            subType: "texto_corto",
            config: {},
            position: 0,
          },
          {
            detailTypeId: "fecha",
            name: "Período de auditoría",
            value: { startDate: new Date("2025-04-01"), endDate: new Date("2025-04-15") },
            subType: "rango",
            config: { dateType: "range" },
            position: 1,
          },
          {
            detailTypeId: "ponderacion",
            name: "Nivel de riesgo actual",
            value: 35,
            subType: "porcentaje",
            config: {},
            position: 2,
          },
        ],
      },
    ]

    await Project.insertMany(newProjects)
    console.log(`✓ ${newProjects.length} proyectos adicionales creados`)

    console.log("\n✅ Datos adicionales agregados exitosamente!")
    console.log(`\nTotal de proyectos en la base de datos: ${await Project.countDocuments()}`)
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await mongoose.connection.close()
    console.log("\n✓ Conexión cerrada")
  }
}

seedData()
