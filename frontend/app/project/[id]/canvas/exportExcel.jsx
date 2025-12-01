import * as XLSX from 'xlsx';

const exportarProyectoExcel = (proyecto) => {
  // Preparar datos en formato plano para Excel
  const datosExcel = [];
  
  // Información del proyecto
  const infoProyecto = {
    'Proyecto': proyecto.name,
    'Descripción Proyecto': proyecto.description,
    'Creado': new Date(proyecto.createdAt).toLocaleDateString(),
    'Actualizado': new Date(proyecto.updatedAt).toLocaleDateString(),
    'Visibilidad': proyecto.visibility,
    'Vistas': proyecto.viewsCount,
    'Propietario': proyecto.ownerId?.name || '',
  };

  // Si el proyecto tiene elements
  if (proyecto.elements && proyecto.elements.length > 0) {
    proyecto.elements.forEach((element) => {
      
      // Si el elemento tiene subElements
      if (element.subElements && element.subElements.length > 0) {
        element.subElements.forEach((subElement) => {
          
          // Si el subElement tiene details
          if (subElement.details && subElement.details.length > 0) {
            subElement.details.forEach((detail) => {
              datosExcel.push({
                ...infoProyecto,
                'Elemento': element.name,
                'Descripción Elemento': element.description,
                'Sub-elemento': subElement.name,
                'Descripción Sub-elemento': subElement.description,
                'Detalle': detail.name,
                'Descripción Detalle': detail.description,
                'Requerido': detail.required ? 'Sí' : 'No',
                'Tipo de Dato': detail.dataType || '',
              });
            });
          } else {
            // SubElement sin details
            datosExcel.push({
              ...infoProyecto,
              'Elemento': element.name,
              'Descripción Elemento': element.description,
              'Sub-elemento': subElement.name,
              'Descripción Sub-elemento': subElement.description,
              'Detalle': '',
              'Descripción Detalle': '',
              'Requerido': '',
              'Tipo de Dato': '',
            });
          }
        });
      } else {
        // Element sin subElements
        datosExcel.push({
          ...infoProyecto,
          'Elemento': element.name,
          'Descripción Elemento': element.description,
          'Sub-elemento': '',
          'Descripción Sub-elemento': '',
          'Detalle': '',
          'Descripción Detalle': '',
          'Requerido': '',
          'Tipo de Dato': '',
        });
      }
    });
  } else {
    // Proyecto sin elements
    datosExcel.push(infoProyecto);
  }

  // Crear el libro de Excel
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(datosExcel);
  
  // Ajustar ancho de columnas
  ws['!cols'] = [
    { wch: 20 }, // Proyecto
    { wch: 30 }, // Descripción Proyecto
    { wch: 12 }, // Creado
    { wch: 12 }, // Actualizado
    { wch: 10 }, // Visibilidad
    { wch: 8 },  // Vistas
    { wch: 20 }, // Propietario
    { wch: 25 }, // Elemento
    { wch: 35 }, // Descripción Elemento
    { wch: 25 }, // Sub-elemento
    { wch: 35 }, // Descripción Sub-elemento
    { wch: 20 }, // Detalle
    { wch: 35 }, // Descripción Detalle
    { wch: 10 }, // Requerido
    { wch: 15 }, // Tipo de Dato
  ];
  
  // Agregar la hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, 'Proyecto');
  
  // Descargar el archivo
  const nombreArchivo = `${proyecto.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);
};

export default exportarProyectoExcel;