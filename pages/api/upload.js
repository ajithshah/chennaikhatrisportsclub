import { put } from '@vercel/blob';
import multer from 'multer';

// Configure multer for in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Disable Next.js body parser for multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Allowed MIME types for images
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Validate environment variables
const validateEnv = () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Missing BLOB_READ_WRITE_TOKEN environment variable');
  }
};

// Process file upload with multer
const processFileUpload = (req) => {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, {}, (err) => {
      if (err) return reject(err);
      if (!req.file) return reject(new Error('No file provided'));
      resolve(req.file);
    });
  });
};

export default async function handler(req, res) {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate environment variables
    validateEnv();

    // Process file upload
    const file = await processFileUpload(req);

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        error: `Only ${ALLOWED_MIME_TYPES.join(', ')} files are allowed`,
      });
    }

    // Check file size (Vercel serverless function limit: 4.5 MB)
    const maxSize = 4.5 * 1024 * 1024; // 4.5 MB in bytes
    if (file.size > maxSize) {
      return res.status(400).json({
        error: `File size exceeds 4.5 MB limit.`,
      });
    }

    // Upload to Vercel Blob
    console.log('Uploading file:', { name: file.originalname });
    const blob = await put(
      `team-logos/${file.originalname}`,
      file.buffer,
      {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: false,
      }
    );

    console.log('Uploaded file:', {
      pathname: blob.pathname,
      url: blob.url,
      contentType: blob.contentType,
    });

    // Respond with format compatible with ManageCricketTeam.js
    res.status(200).json({
      message: 'File uploaded successfully',
      fileId: blob.pathname,
      fileUrl: blob.url,
    });
  } catch (error) {
    console.error('Error in upload handler:', error);
    const status = error.message.includes('No file provided') ||
                  error.message.includes('Only') ||
                  error.message.includes('File size') ? 400 : 500;

    res.status(status).json({
      error: error.message,
      details: error.response?.data || null,
    });
  }
}
