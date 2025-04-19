import { google } from 'googleapis';
import multer from 'multer';
import stream from 'stream';

// Configure multer for in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Disable Next.js body parser to handle multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Middleware to parse multipart form data
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });

export default async function handler(req, res) {
  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Restrict to image files
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPEG, PNG, or GIF images are allowed' });
    }

    console.log('Environment Variables:', {
      folderId: process.env.GOOGLE_FOLDER_ID,
    });

    if (!process.env.GOOGLE_FOLDER_ID) {
      return res.status(500).json({ error: 'Missing GOOGLE_FOLDER_ID' });
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return res.status(500).json({ error: 'Missing GOOGLE_SERVICE_ACCOUNT_KEY' });
    }

    // Authenticate with base64-encoded service account key
    const serviceAccountKey = Buffer.from(
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      'base64'
    ).toString();
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(serviceAccountKey),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Convert buffer to stream
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    // Upload file to Google Drive
    const fileMetadata = {
      name: req.file.originalname,
      parents: [process.env.GOOGLE_FOLDER_ID],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: bufferStream,
    };

    const { data } = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name',
    });

    console.log('Uploaded file:', data);

    // Set file permissions to "Anyone with the link"
    await drive.permissions.create({
      fileId: data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Generate direct URL for embedding
    const fileUrl = `https://drive.google.com/uc?export=download&id=${data.id}`;

    res.status(200).json({
      message: 'File uploaded',
      fileId: data.id,
      fileUrl,
    });
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
}