import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; 
const client = new MongoClient(uri);

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const timestamp = new Date().toISOString();

  console.log(`Tracking pixel loaded - IP: ${ip}, User-Agent: ${userAgent}, Time: ${timestamp}`);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB.');

    // Sử dụng tên database và collection đúng
    const database = client.db('emailtrack'); // Tên database
    const collection = database.collection('logs'); // Tên collection

    const logEntry = {
      ip,
      userAgent,
      timestamp,
    };

    console.log('Inserting log entry into MongoDB...');
    await collection.insertOne(logEntry);
    console.log('Log entry saved to MongoDB.');

    res.setHeader('Content-Type', 'image/png');
    const pixelBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/axmT6kAAAAASUVORK5CYII=',
      'base64'
    );
    res.status(200).send(pixelBuffer);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
}
