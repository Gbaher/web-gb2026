// ─────────────────────────────────────────────────────────────────
//  Growth Brands — Google Apps Script Webhook
//  Recibe datos de Cal.com y del formulario de contacto
//  y los guarda en Google Sheets automáticamente.
//
//  INSTRUCCIONES:
//  1. Abre tu Google Sheet → Extensiones → Apps Script
//  2. Borra el código existente y pega TODO este archivo
//  3. Guarda (Ctrl+S)
//  4. Click en "Implementar" → "Nueva implementación"
//  5. Tipo: "Aplicación web"
//  6. Ejecutar como: "Yo (tu email)"
//  7. Acceso: "Cualquier usuario"
//  8. Click "Implementar" → copia la URL generada
//  9. Usa esa URL como webhook en Cal.com y en el formulario
// ─────────────────────────────────────────────────────────────────

var SHEET_CALCOM   = 'Sesiones Cal.com';
var SHEET_CONTACTO = 'Contactos';

// ── Recibe peticiones GET (test de conexión) ──────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Webhook activo ✓' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Recibe peticiones POST (datos reales) ─────────────────────────
function doPost(e) {
  try {
    var raw  = e.postData ? e.postData.contents : '{}';
    var data = JSON.parse(raw);

    // Detecta si viene de Cal.com o del formulario de contacto
    if (data.triggerEvent || data.type) {
      guardarCalCom(data);
    } else {
      guardarContacto(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Guarda booking de Cal.com ─────────────────────────────────────
function guardarCalCom(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_CALCOM);

  // Crea la hoja si no existe y agrega encabezados
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_CALCOM);
    sheet.appendRow([
      'Fecha registro', 'Evento', 'Estado',
      'Nombre cliente', 'Email cliente',
      'Fecha sesión', 'Hora inicio', 'Hora fin',
      'Zona horaria', 'Notas / Mensaje'
    ]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#ed2450').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  // Extrae campos del payload de Cal.com
  var payload  = data.payload || data;
  var attendee = (payload.attendees && payload.attendees[0]) || {};
  var start    = payload.startTime || payload.start || '';
  var end      = payload.endTime   || payload.end   || '';

  var fechaSesion = start ? new Date(start).toLocaleDateString('es-BO') : '';
  var horaInicio  = start ? new Date(start).toLocaleTimeString('es-BO', {hour:'2-digit', minute:'2-digit'}) : '';
  var horaFin     = end   ? new Date(end).toLocaleTimeString('es-BO', {hour:'2-digit', minute:'2-digit'})   : '';

  sheet.appendRow([
    new Date().toLocaleString('es-BO'),
    payload.title       || payload.eventTitle || '',
    data.triggerEvent   || 'BOOKING_CREATED',
    attendee.name       || payload.name  || '',
    attendee.email      || payload.email || '',
    fechaSesion,
    horaInicio,
    horaFin,
    payload.organizer   ? payload.organizer.timeZone : '',
    attendee.notes      || payload.additionalNotes || ''
  ]);
}

// ── Guarda mensaje del formulario de contacto ─────────────────────
function guardarContacto(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_CONTACTO);

  // Crea la hoja si no existe y agrega encabezados
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_CONTACTO);
    sheet.appendRow(['Fecha', 'Nombre', 'Email', 'Mensaje']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#ed2450').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date().toLocaleString('es-BO'),
    data.nombre  || data.name    || '',
    data.email   || '',
    data.mensaje || data.message || ''
  ]);
}
