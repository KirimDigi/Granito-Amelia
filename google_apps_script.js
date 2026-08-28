const SPREADSHEET_ID = '1QsChHfnFPvM3K1spQteojRhA2kpTZdAtDWiC9zscY48';
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    
    // Ensure header row is set if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['timestamp', 'nama tamu', 'ucapan', 'konfirmasi kehadiran', 'jumlah tamu']);
    }
    
    // Parse incoming data
    let params = {};
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        // Fallback to urlencoded parameters
        params = e.parameter;
      }
    } else {
      params = e.parameter;
    }
    
    const timestamp = new Date();
    const namaTamu = params['nama tamu'] || params['author'] || params['name'] || '';
    const ucapan = params['ucapan'] || params['comment'] || '';
    const konfirmasi = params['konfirmasi kehadiran'] || params['attendance'] || '';
    const jumlahTamu = params['jumlah tamu'] || params['guest'] || '1';
    
    // Append new row
    sheet.appendRow([timestamp, namaTamu, ucapan, konfirmasi, jumlahTamu]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Ucapan berhasil dikirim'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*'
    });
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({ 'Access-Control-Allow-Origin': '*' });
    }
    
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({ 'Access-Control-Allow-Origin': '*' });
    }
    
    const headers = rows[0].map(h => h.toString().toLowerCase().trim());
    const data = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const record = {};
      headers.forEach((header, index) => {
        let val = row[index];
        if (val instanceof Date) {
          val = val.toISOString();
        }
        record[header] = val;
      });
      data.push(record);
    }
    
    // Sort descending by timestamp
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({ 'Access-Control-Allow-Origin': '*' });
  }
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}
