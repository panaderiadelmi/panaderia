/**
 * ============================================================
 *  DELMI SORIANO — Google Apps Script para Google Sheets
 * ============================================================
 *  INSTRUCCIONES:
 *  1. Ve a https://sheets.google.com → Crea una hoja nueva
 *  2. Menú: Extensiones → Apps Script
 *  3. Borra el código que hay y pega TODO este archivo
 *  4. Guarda (Ctrl+S) con nombre "Formulario Panadería"
 *  5. Haz clic en "Implementar" → "Nueva implementación"
 *  6. Tipo: "Aplicación web"
 *  7. Ejecutar como: Tu cuenta
 *  8. Quién tiene acceso: "Cualquier persona"
 *  9. Copia la URL que te da → Pégala en script.js (GOOGLE_SCRIPT_URL)
 * ============================================================
 */

// ID de tu hoja de Google Sheets
// (lo encuentras en la URL de la hoja, entre /d/ y /edit)
// Ejemplo: https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';

// Nombre de la pestaña donde se guardarán los datos
const SHEET_NAME = 'Pedidos';

/**
 * Cabeceras de las columnas en Google Sheets
 */
const HEADERS = ['Fecha', 'Nombre', 'Email', 'Teléfono', 'Tipo de Pedido', 'Mensaje'];

/**
 * Se llama automáticamente cuando el formulario hace POST
 */
function doPost(e) {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    let   sheet = ss.getSheetByName(SHEET_NAME);

    // Crear la pestaña si no existe
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Añadir cabeceras en la primera fila
      sheet.appendRow(HEADERS);

      // Formatear cabeceras (negrita + color de fondo)
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#F59E0B');
      headerRange.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 160);  // Fecha
      sheet.setColumnWidth(2, 160);  // Nombre
      sheet.setColumnWidth(3, 200);  // Email
      sheet.setColumnWidth(4, 140);  // Teléfono
      sheet.setColumnWidth(5, 180);  // Tipo de Pedido
      sheet.setColumnWidth(6, 400);  // Mensaje
    }

    // Parsear el JSON del formulario
    const data = JSON.parse(e.postData.contents);

    // Añadir fila con los datos del formulario
    sheet.appendRow([
      data.fecha    || new Date().toLocaleString('es-ES'),
      data.nombre   || '',
      data.email    || '',
      data.telefono || '',
      data.tipo     || '',
      data.mensaje  || ''
    ]);

    // Respuesta con cabeceras CORS para evitar errores
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función de prueba — ejecútala desde el editor de Apps Script
 * para verificar que todo funciona antes de implementar
 */
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        nombre:   'Test Usuario',
        email:    'test@example.com',
        telefono: '+34 600 000 000',
        tipo:     '🍞 Pan de Masa Madre',
        mensaje:  'Quiero pedir 2 barras para el sábado.',
        fecha:    new Date().toLocaleString('es-ES')
      })
    }
  };
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
