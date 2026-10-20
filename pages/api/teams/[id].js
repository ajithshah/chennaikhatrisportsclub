import { allowSeason3Read } from "@/lib/season3Access";
import { getCollection } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

// Helper function to parse team ID (handles both ObjectId and string formats)
function parseTeamId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}

export default async function handler(req, res) {
  if (req.method === "GET" && !(await allowSeason3Read(req, res))) return;

  const { id } = req.query;
  const collection = await getCollection("cricket_teams");
  const teamId = parseTeamId(id);

  switch (req.method) {
    case "GET":
      try {
        const team = await collection.findOne({ _id: teamId });
        if (!team) {
          return res.status(404).json({ error: "Team not found" });
        }
        res.status(200).json({ 
          ...team, 
          id: team._id.toString() 
        });
      } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).json({ error: "Failed to fetch team" });
      }
      break;

    case "PUT":
      try {
        const updateData = req.body;
        // Remove id and _id from update data to prevent modification
        delete updateData.id;
        delete updateData._id;
        
        const result = await collection.updateOne(
          { _id: teamId },
          { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Team not found" });
        }
        
        const updatedTeam = await collection.findOne({ _id: teamId });
        res.status(200).json({ 
          ...updatedTeam, 
          id: updatedTeam._id.toString() 
        });
      } catch (error) {
        console.error("Error updating team:", error);
        res.status(500).json({ error: "Failed to update team" });
      }
      break;

    case "DELETE":
      try {
        const result = await collection.deleteOne({ _id: teamId });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Team not found" });
        }
        res.status(200).json({ message: "Team deleted successfully" });
      } catch (error) {
        console.error("Error deleting team:", error);
        res.status(500).json({ error: "Failed to delete team" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
