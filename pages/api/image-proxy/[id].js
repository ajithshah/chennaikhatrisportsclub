// Proxy API to fetch Google Drive images and avoid CORS/rate limiting issues

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing image ID" });
  }

  try {
    // Set cache headers - cache for 1 hour
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.setHeader("Content-Type", "image/jpeg");

    // Try the thumbnail URL first
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w400`;
    
    const response = await fetch(thumbnailUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      // Fallback to export view URL
      const fallbackUrl = `https://drive.google.com/uc?export=view&id=${id}`;
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!fallbackResponse.ok) {
        return res.status(404).json({ error: "Image not found" });
      }

      const buffer = await fallbackResponse.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
}
