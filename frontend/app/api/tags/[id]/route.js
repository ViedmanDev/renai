/**
 * API ROUTE: /api/tags/[id]
 * Maneja operaciones de actualización y eliminación de etiquetas específicas
 *
 * Colección MongoDB: banderas
 * Endpoints:
 * - PUT /api/tags/[id] - Actualizar etiqueta
 * - DELETE /api/tags/[id] - Eliminar etiqueta
 */

import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

import { ObjectId } from "mongodb";

/**
 * PUT /api/tags/[id]
 * Actualiza una etiqueta existente
 */

/**
 * DELETE /api/tags/[id]
 * Elimina una etiqueta
 */
// export async function DELETE(request, { params }) {
//   try {
//     const db = await getDB();
//     const { id } = params;

//     // Validar ObjectId
//     if (!ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { error: "ID de etiqueta inválido" },
//         { status: 400 }
//       );
//     }

//     // Opcional: Verificar si la etiqueta está siendo usada
//     // Descomenta si quieres evitar eliminar etiquetas en uso
//     /*
//     const projectsUsingTag = await db.collection('projects').countDocuments({
//       'details.tags': id
//     });

//     if (projectsUsingTag > 0) {
//       return NextResponse.json(
//         {
//           error: `No se puede eliminar. La etiqueta está siendo usada en ${projectsUsingTag} proyecto(s)`
//         },
//         { status: 400 }
//       );
//     }
//     */

//     // Eliminar etiqueta
//     const result = await db.collection("tags").deleteOne({
//       _id: new ObjectId(id),
//     });

//     if (result.deletedCount === 0) {
//       return NextResponse.json(
//         { error: "Etiqueta no encontrada" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Etiqueta eliminada correctamente",
//       deletedId: id,
//     });
//   } catch (error) {
//     console.error("[ERROR] Error deleting tag:", error);
//     return NextResponse.json(
//       { error: "Error al eliminar etiqueta" },
//       { status: 500 }
//     );
//   }
// }
