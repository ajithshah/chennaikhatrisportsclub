import { getCollection } from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const collection = await getCollection("images");
    const image = await collection.findOne({ _id: id });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Convert base64 back to buffer
    const buffer = Buffer.from(image.data, "base64");

    // Set appropriate headers
    res.setHeader("Content-Type", image.mimetype);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    // Send the image
    return res.send(buffer);
  } catch (error) {
    console.error("Error serving image:", error);
    return res.status(500).json({ error: "Failed to serve image" });
  }
}
