import { put } from "@vercel/blob";
import multer from "multer";
import { config as dotenvConfig } from "dotenv";

// Initialize configuration for environment variables
dotenvConfig();

// Setup multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false,
  },
};

// Allowed MIME types for validation
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"];

// File size limit (4.5 MB)
const FILE_SIZE_LIMIT = 4.5 * 1024 * 1024;

// Validate necessary environment variables
const validateEnv = () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN environment variable");
  }
};

// Processing file upload using multer middleware
const processFileUpload = (req) => {
  return new Promise((resolve, reject) => {
    upload.single("file")(req, {}, (err) => {
      if (err) return reject(err);
      if (!req.file) return reject(new Error("No file provided"));
      resolve(req.file);
    });
  });
};

// Main handler for the API route
export default async function handler(req, res) {
  // Ensure that only POST method is allowed
  if (req.method !== "POST") {
    console.log("Method not allowed");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate environment variables
    validateEnv();

    // Process file upload
    const file = await processFileUpload(req);
    // console.log("Received file:", file);

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      console.log("Invalid MIME type:", file.mimetype);
      return res.status(400).json({
        error: `Only ${ALLOWED_MIME_TYPES.join(", ")} files are allowed`,
      });
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMIT) {
      console.log("File size limit exceeded:", file.size);
      return res.status(400).json({
        error: `File size exceeds ${FILE_SIZE_LIMIT / (1024 * 1024)} MB limit.`,
      });
    }

    // Upload the file to Vercel Blob storage
    const blob = await put(`team-logos/${file.originalname}`, file.buffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
      addRandomSuffix: false,
    });

    // console.log("File uploaded successfully:", blob);
    return res.status(200).json({
      message: "File uploaded successfully",
      fileUrl: blob.url,
      fileId: blob.pathname,
    });
  } catch (error) {
    console.error("Error in upload handler:", error);

    // Determine appropriate status code based on error message
    const status =
      error.message.includes("No file provided") ||
      error.message.includes("Only") ||
      error.message.includes("File size")
        ? 400
        : 500;

    return res.status(status).json({ error: error.message });
  }
}
