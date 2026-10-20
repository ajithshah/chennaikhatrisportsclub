import { getCollection } from "../../../lib/mongodb";
import { getSettings } from "../../../lib/settings";

export default async function handler(req, res) {
  const collection = await getCollection("users");

  switch (req.method) {
    case "GET":
      try {
        const users = await collection.find({}).toArray();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
      }
      break;

    case "POST":
      try {
        const userData = req.body;
        // Use uid as the document _id if provided
        if (userData.uid) {
          userData._id = userData.uid;
        }
        
        // Check if user exists (for upsert behavior)
        const existingUser = await collection.findOne({ _id: userData._id });
        
        if (existingUser) {
          // Merge operation
          await collection.updateOne(
            { _id: userData._id },
            { $set: userData }
          );
          const updatedUser = await collection.findOne({ _id: userData._id });
          res.status(200).json(updatedUser);
        } else {
          // New members can be paused by the super admin
          const { signupsOpen } = await getSettings();
          if (!signupsOpen) {
            return res.status(403).json({ error: "New member sign-ups are paused" });
          }
          // Insert new user
          await collection.insertOne(userData);
          res.status(201).json(userData);
        }
      } catch (error) {
        console.error("Error creating/updating user:", error);
        res.status(500).json({ error: "Failed to create/update user" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
