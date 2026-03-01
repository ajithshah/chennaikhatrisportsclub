import { getCollection } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

// Helper function to parse match ID (handles both ObjectId and string formats)
function parseMatchId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}

export default async function handler(req, res) {
  const { id } = req.query;
  const collection = await getCollection("matches");
  const matchId = parseMatchId(id);

  switch (req.method) {
    case "GET":
      try {
        const match = await collection.findOne({ _id: matchId });
        if (!match) {
          return res.status(404).json({ error: "Match not found" });
        }
        res.status(200).json({ 
          ...match, 
          id: match._id.toString() 
        });
      } catch (error) {
        console.error("Error fetching match:", error);
        res.status(500).json({ error: "Failed to fetch match" });
      }
      break;

    case "PUT":
      try {
        const updateData = req.body;
        // Remove id and _id from update data to prevent modification
        delete updateData.id;
        delete updateData._id;
        
        const result = await collection.updateOne(
          { _id: matchId },
          { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Match not found" });
        }
        
        const updatedMatch = await collection.findOne({ _id: matchId });
        res.status(200).json({ 
          ...updatedMatch, 
          id: updatedMatch._id.toString() 
        });
      } catch (error) {
        console.error("Error updating match:", error);
        res.status(500).json({ error: "Failed to update match" });
      }
      break;

    case "DELETE":
      try {
        const result = await collection.deleteOne({ _id: matchId });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Match not found" });
        }
        res.status(200).json({ message: "Match deleted successfully" });
      } catch (error) {
        console.error("Error deleting match:", error);
        res.status(500).json({ error: "Failed to delete match" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
