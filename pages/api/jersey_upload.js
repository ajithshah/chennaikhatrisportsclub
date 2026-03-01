import multer from "multer";
import { getCollection } from "../../lib/mongodb";

// Setup multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false,
  },
};

// Allowed MIME types for validation
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"];

// File size limit (5 MB)
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

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
    // Process file upload
    const file = await processFileUpload(req);

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

    // Generate random string for unique filename
    const randomString =
      Math.random().toString(36).substring(2, 8) + Date.now().toString(36);
    const fileExtension = file.originalname.split(".").pop();
    const uniqueFileName = `${
      file.originalname.split(".")[0]
    }-${randomString}.${fileExtension}`;

    // Convert buffer to base64
    const base64Data = file.buffer.toString("base64");
    
    // Store in MongoDB
    const collection = await getCollection("images");
    const imageDoc = {
      _id: `jersey_${uniqueFileName}`,
      filename: uniqueFileName,
      category: "jersey",
      mimetype: file.mimetype,
      data: base64Data,
      size: file.size,
      createdAt: new Date().toISOString(),
    };
    
    await collection.insertOne(imageDoc);

    // Return URL that points to our image serving API
    const fileUrl = `/api/images/${imageDoc._id}`;
    
    return res.status(200).json({
      message: "File uploaded successfully",
      fileUrl: fileUrl,
      fileId: imageDoc._id,
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
