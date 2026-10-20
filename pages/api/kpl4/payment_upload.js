import multer from "multer";
import { randomUUID } from "crypto";
import { getCollection } from "../../../lib/mongodb";
import { getUidFromRequest } from "../../../lib/adminAuth";

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const FILE_SIZE_LIMIT = 4 * 1024 * 1024;

const processFileUpload = (req, res) =>
  new Promise((resolve, reject) => {
    upload.single("file")(req, res, (err) => {
      if (err) return reject(err);
      if (!req.file) return reject(new Error("No file provided"));
      resolve(req.file);
    });
  });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const uid = await getUidFromRequest(req);
    if (!uid) return res.status(401).json({ error: "Please sign in to upload" });

    const file = await processFileUpload(req, res);

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ error: "Only JPG or PNG images are allowed" });
    }
    if (file.size > FILE_SIZE_LIMIT) {
      return res.status(400).json({ error: "Image must be under 4 MB" });
    }

    const id = `payment_${randomUUID()}`;
    const collection = await getCollection("images");
    await collection.insertOne({
      _id: id,
      filename: file.originalname,
      category: "kpl4_payment",
      uploadedBy: uid,
      mimetype: file.mimetype,
      data: file.buffer.toString("base64"),
      size: file.size,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ fileUrl: `/api/images/${id}` });
  } catch (error) {
    console.error("Error uploading payment screenshot:", error);
    const status = /No file|Only|must be|File too large/.test(error.message) ? 400 : 500;
    return res.status(status).json({ error: error.message });
  }
}
