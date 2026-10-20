import { allowSeason3Read } from "@/lib/season3Access";
import { getCollection } from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "GET" && !(await allowSeason3Read(req, res))) return;

  const collection = await getCollection("cricket_auction_teams");

  switch (req.method) {
    case "GET":
      try {
        const { status } = req.query;
        let query = {};

        if (status) {
          const statusArray = status.split(",");
          if (statusArray.length > 1) {
            query.status = { $in: statusArray };
          } else {
            query.status = status;
          }
        }

        const teams = await collection.find(query).toArray();

        // Get player counts for each team
        const playersCollection = await getCollection("cricket_auction_players");

        const teamsWithCounts = await Promise.all(
          teams.map(async (team) => {
            const playerCount = await playersCollection.countDocuments({
              team: team.teamName,
            });
            return {
              ...team,
              id: team._id.toString(),
              playerCount,
            };
          })
        );

        res.status(200).json(teamsWithCounts);
      } catch (error) {
        console.error("Error fetching auction teams:", error);
        res.status(500).json({ error: "Failed to fetch teams" });
      }
      break;

    case "POST":
      try {
        const teamData = req.body;
        teamData.createdAt = new Date();
        teamData.updatedAt = new Date();
        const result = await collection.insertOne(teamData);
        res.status(201).json({
          id: result.insertedId.toString(),
          _id: result.insertedId,
          ...teamData,
        });
      } catch (error) {
        console.error("Error creating team:", error);
        res.status(500).json({ error: "Failed to create team" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
