// =========================================================================
// GOOGLE APPS SCRIPT FOR RSVP & WISHES ( Amelia & Granito )
// =========================================================================
// Instructions:
// 1. Open your Google Spreadsheet: https://docs.google.com/spreadsheets/d/1QsChHfnFPvM3K1spQteojRhA2kpTZdAtDWiC9zscY48/edit
// 2. Click "Extensions" -> "Apps Script".
// 3. Delete any default code inside the editor and paste this code.
// 4. Click "Deploy" -> "New deployment".
// 5. Select type "Web app".
// 6. Set "Execute as" to "Me".
// 7. Set "Who has access" to "Anyone" (important for web access).
// 8. Click "Deploy" and authorize permissions.
// 9. Copy the generated Web App URL.
// 10. Open index.html, find: var APPS_SCRIPT_URL = ''; (near the bottom)
//     and paste the URL inside the quotes: var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';
// =========================================================================

const SPREADSHEET_ID = '1QsChHfnFPvM3K1spQteojRhA2kpTZdAtDWiC9zscY48';
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // Parse input parameter/JSON body
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    const timestamp = new Date();
    const namaTamu = data.author || data.nama || '';
    const ucapan = data.comment || data.ucapan || '';
    const konfirmasi = data.attendance || data.konfirmasi || '';
    const jumlahTamu = data.guest || data.jumlah || '-';
    
    // Append row matching order:
    // 1. timestamp, 2. nama tamu, 3. ucapan, 4. konfirmasi kehadiran, 5. jumlah tamu
    sheet.appendRow([timestamp, namaTamu, ucapan, konfirmasi, jumlahTamu]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'RSVP berhasil disimpan'
    })).setMimeType(ContentService.MimeType.JSON);
       
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    const wishes = [];
    
    // Skip headers row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Skip empty rows
      if (!row[1] && !row[2]) continue;
      
      wishes.push({
        timestamp: row[0],
        nama: row[1],
        ucapan: row[2],
        konfirmasi: row[3],
        jumlah: row[4]
      });
    }
    
    // Sort descending (newest comments first)
    wishes.reverse();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: wishes
    })).setMimeType(ContentService.MimeType.JSON);
       
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
