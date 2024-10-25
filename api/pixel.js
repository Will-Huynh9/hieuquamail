import { google } from 'googleapis';
import { readFileSync } from 'fs';

const auth = new google.auth.GoogleAuth({
  keyFile: 'path/to/your/service-account-file.json', // Đường dẫn tới file JSON
  scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Quyền truy cập
});

const sheets = google.sheets({ version: 'v4', auth });

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const timestamp = new Date().toISOString();

  console.log(`Tracking pixel loaded - IP: ${ip}, User-Agent: ${userAgent}, Time: ${timestamp}`);

  try {
    const spreadsheetId = 'YOUR_SPREADSHEET_ID'; // ID của Google Sheet
    const range = 'Sheet1!A:C'; // Vùng mà bạn muốn ghi dữ liệu vào

    const values = [
      [timestamp, ip, userAgent], // Dữ liệu cần ghi
    ];

    const resource = {
      values,
    };

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      resource,
      valueInputOption: 'RAW',
    });

    console.log(`${response.data.updates.updatedCells} cells appended.`);
    
    res.setHeader('Content-Type', 'image/png');
    const pixelBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/axmT6kAAAAASUVORK5CYII=',
      'base64'
    );
    res.status(200).send(pixelBuffer);
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    res.status(500).send('Internal Server Error');
  }
}
