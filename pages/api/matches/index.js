import { allowSeason3Read } from "@/lib/season3Access";
import { getCollection } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "GET" && !(await allowSeason3Read(req, res))) return;

  const collection = await getCollection("matches");

  switch (req.method) {
    case "GET":
      try {
        const { orderBy: orderField, orderDir } = req.query;
        
        let sortOption = {};
        if (orderField) {
          sortOption[orderField] = orderDir === "desc" ? -1 : 1;
        }
        
        const matches = await collection
          .find({})
          .sort(sortOption)
          .toArray();
          
        // Transform _id to id for frontend compatibility
        const transformedMatches = matches.map(match => ({
          ...match,
          id: match._id.toString(),
        }));
        res.status(200).json(transformedMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({ error: "Failed to fetch matches" });
      }
      break;

    case "POST":
      try {
        const matchData = req.body;
        const result = await collection.insertOne(matchData);
        res.status(201).json({ 
          id: result.insertedId.toString(), 
          _id: result.insertedId,
          ...matchData 
        });
      } catch (error) {
        console.error("Error creating match:", error);
        res.status(500).json({ error: "Failed to create match" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
