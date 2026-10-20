import { getCollection } from "../../../lib/mongodb";
import { getUidFromRequest, isSuperAdminRequest } from "../../../lib/adminAuth";

export default async function handler(req, res) {
  const { id } = req.query;
  const collection = await getCollection("users");

  switch (req.method) {
    case "GET":
      try {
        const user = await collection.findOne({ _id: id });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
      }
      break;

    case "PUT":
      try {
        const updateData = req.body;
        const result = await collection.updateOne(
          { _id: id },
          { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const updatedUser = await collection.findOne({ _id: id });
        res.status(200).json(updatedUser);
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update user" });
      }
      break;

    case "DELETE":
      try {
        // Only a super admin may delete a user, and never themselves
        if (!(await isSuperAdminRequest(req))) {
          return res.status(403).json({ error: "Only a super admin can delete users" });
        }
        if ((await getUidFromRequest(req)) === id) {
          return res.status(400).json({ error: "You can't delete your own account" });
        }
        const result = await collection.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
