export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const timestamp = new Date().toISOString();

  console.log(`Tracking pixel loaded - IP: ${ip}, User-Agent: ${userAgent}, Time: ${timestamp}`);

  res.setHeader('Content-Type', 'image/png');
  const pixelBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/axmT6kAAAAASUVORK5CYII=',
    'base64'
  );
  res.status(200).send(pixelBuffer);
}
