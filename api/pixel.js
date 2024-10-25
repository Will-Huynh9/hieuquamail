import { MongoClient } from 'mongodb';

// Lấy URI từ biến môi trường
const uri = process.env.MONGODB_URI; 
const client = new MongoClient(uri);

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const timestamp = new Date().toISOString();

  // Ghi lại thông tin khi pixel được tải
  console.log(`Tracking pixel loaded - IP: ${ip}, User-Agent: ${userAgent}, Time: ${timestamp}`);

  try {
    // Kết nối đến MongoDB
    await client.connect();
    const database = client.db('email_tracking'); // Tên database
    const collection = database.collection('logs'); // Tên collection

    const logEntry = {
      ip,
      userAgent,
      timestamp,
    };

    // Chèn log vào MongoDB
    await collection.insertOne(logEntry);
    console.log('Log entry saved to MongoDB.'); // Kiểm tra khi lưu log thành công

  } catch (error) {
    console.error('Error connecting to MongoDB:', error); // Kiểm tra lỗi kết nối
    res.status(500).send('Internal Server Error');
    return; // Dừng thực thi nếu có lỗi
  } finally {
    await client.close(); // Đảm bảo đóng kết nối
  }

  res.setHeader('Content-Type', 'image/png');
  const pixelBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/axmT6kAAAAASUVORK5CYII=',
    'base64'
  );
  res.status(200).send(pixelBuffer);
}
