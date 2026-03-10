import { getCollection } from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Team ID required" });
  }

  const teamsCollection = await getCollection("cricket_auction_teams");
  const playersCollection = await getCollection("cricket_auction_players");

  switch (req.method) {
    case "GET":
      try {
        let team;

        // Try to find by ObjectId first
        try {
          team = await teamsCollection.findOne({ _id: new ObjectId(id) });
        } catch (e) {
          // If invalid ObjectId, try by shortName or teamName
          team = await teamsCollection.findOne({
            $or: [{ shortName: id }, { teamName: id }],
          });
        }

        if (!team) {
          return res.status(404).json({ error: "Team not found" });
        }

        // Fetch all players for this team
        const players = await playersCollection
          .find({ team: team.teamName })
          .toArray();

        const transformedPlayers = players.map((player) => ({
          ...player,
          id: player._id.toString(),
        }));

        res.status(200).json({
          ...team,
          id: team._id.toString(),
          players: transformedPlayers,
        });
      } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).json({ error: "Failed to fetch team" });
      }
      break;

    case "PUT":
      try {
        const updateData = req.body;
        updateData.updatedAt = new Date();

        const result = await teamsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Team not found" });
        }

        res.status(200).json({ message: "Team updated successfully" });
      } catch (error) {
        console.error("Error updating team:", error);
        res.status(500).json({ error: "Failed to update team" });
      }
      break;

    case "DELETE":
      try {
        const result = await teamsCollection.deleteOne({
          _id: new ObjectId(id),
        });

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
