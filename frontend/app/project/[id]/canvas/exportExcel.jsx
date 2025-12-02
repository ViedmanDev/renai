import * as XLSX from "xlsx-js-style";

// Función auxiliar para fusionar celdas repetidas por columna

const crearMergesPorColumna = (ws, colIndex, startRow, endRow) => {
  let inicio = startRow;

  for (let r = startRow + 1; r <= endRow + 1; r++) {
    const prevCell = ws[XLSX.utils.encode_cell({ r: r - 1, c: colIndex })];
    const cell = ws[XLSX.utils.encode_cell({ r, c: colIndex })];

    const prevVal = prevCell?.v ?? null;
    const currVal = cell?.v ?? null;

    if (currVal !== prevVal) {
      if (r - 1 > inicio) {
        ws["!merges"].push({
          s: { r: inicio, c: colIndex },
          e: { r: r - 1, c: colIndex }
        });
      }
      inicio = r;
    }
  }
};


const exportarProyectoExcel = (proyecto) => {
const datosExcel = [];

// Información general del proyecto
const infoProyecto = {
"Proyecto": proyecto.name,
"Descripción Proyecto": proyecto.description,
"Propietario": proyecto.ownerId?.name || "",
};

// Transformación jerárquica 
if (proyecto.elements?.length) {
proyecto.elements.forEach((element) => {
if (element.subElements?.length) {
element.subElements.forEach((sub) => {
if (sub.details?.length) {
sub.details.forEach((detail) => {
datosExcel.push({
...infoProyecto,
"Elemento": element.name,
"Descripción Elemento": element.description,
"Sub-elemento": sub.name,
"Descripción Sub-elemento": sub.description,
"Detalle": detail.name,
"Descripción Detalle": detail.description,
"Valor": detail.value ?? "",
"Moneda": detail.currencyType ?? "",
"Requerido": detail.required ? "Sí" : "No",
"Tipo de Dato": detail.dataType || "",


});
});
} else {
datosExcel.push({
...infoProyecto,
"Elemento": element.name,
"Descripción Elemento": element.description,
"Sub-elemento": sub.name,
"Descripción Sub-elemento": sub.description,
"Detalle": "",
"Descripción Detalle": "",
"Valor": "",
"Moneda": "",
"Requerido": "",
"Tipo de Dato": "",

});
}
});
} else {
datosExcel.push({
...infoProyecto,
"Elemento": element.name,
"Descripción Elemento": element.description,
"Sub-elemento": "",
"Descripción Sub-elemento": "",
"Detalle": "",
"Descripción Detalle": "",
"Valor": "",
"Moneda": "",
"Requerido": "",
"Tipo de Dato": "",

});
}
});
} else {
datosExcel.push(infoProyecto);
}

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(datosExcel, { origin: "A5" });


ws["A1"] = {
v: `Proyecto: ${proyecto.name}`,
s: {
font: { bold: true, sz: 18 },
alignment: { horizontal: "center" },
},
};

ws["!merges"] = [
{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, // Merge A1:O1
];

//  estilo  headers

const headerCells = Object.keys(datosExcel[0]);
headerCells.forEach((col, index) => {
const cellRef = XLSX.utils.encode_cell({ r: 4, c: index });
ws[cellRef].s = {
fill: { fgColor: { rgb: "D9E1F2" } },
font: { bold: true },
border: {
top: { style: "thin", color: { rgb: "000000" } },
left: { style: "thin", color: { rgb: "000000" } },
right: { style: "thin", color: { rgb: "000000" } },
bottom: { style: "thin", color: { rgb: "000000" } },
},
};
});


// Estilo celdas

Object.keys(ws).forEach((cell) => {
if (cell[0] === "!") return;
ws[cell].s = ws[cell].s || {};
ws[cell].s.border = {
top: { style: "thin", color: { rgb: "000000" } },
left: { style: "thin", color: { rgb: "000000" } },
right: { style: "thin", color: { rgb: "000000" } },
bottom: { style: "thin", color: { rgb: "000000" } },
};
ws[cell].s.alignment = { vertical: "center", wrapText: true };
});


ws["!cols"] = [
  { wch: 20 }, // Proyecto
  { wch: 35 }, // Descripción Proyecto
  { wch: 20 }, // Propietario
  { wch: 25 }, { wch: 35 },
  { wch: 25 }, { wch: 35 },
  { wch: 25 }, { wch: 35 },
  { wch: 12 }, // Valor
  { wch: 10 }, // Moneda
  { wch: 10 }, // Requerido
  { wch: 15 }, // Tipo de Dato
];


XLSX.utils.book_append_sheet(wb, ws, "Proyecto");


//Fusionar celdas repetidas

ws["!merges"] = ws["!merges"] || [];

const dataStartRow = 5; 
const dataEndRow = datosExcel.length + 4;

const columnasFusionar = {
  elemento: 3,
  descripcionElemento: 4,
  subElemento: 5,
  descripcionSub: 6,
  detalle: 7,
  descripcionDetalle: 8
};


Object.values(columnasFusionar).forEach((colIndex) => {
  crearMergesPorColumna(ws, colIndex, dataStartRow, dataEndRow);
});


XLSX.writeFile(
wb,
`${proyecto.name.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`
);
};

export default exportarProyectoExcel;
