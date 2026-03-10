import { MongoClient } from "mongodb";

const MONGO_URI =
  "mongodb+srv://chennaikhatrisportsclub:chennaikhatrisportsclub@chennaikhatrisportsclub.x08xczo.mongodb.net/?retryWrites=true&w=majority&appName=chennaikhatrisportsclub";
const MONGO_DB = "chennaikhatrisportsclub";

const teams = [
  {
    teamName: "Chennai Khatri Kings",
    shortName: "CKK",
    status: "active",
    players: [],
    teamLogo: "",
    createdAt: new Date(),
  },
  {
    teamName: "Mumbai Khatri Walas",
    shortName: "MKW",
    status: "active",
    players: [],
    teamLogo: "",
    createdAt: new Date(),
  },
  {
    teamName: "Kolkata Khatri Riders",
    shortName: "KKR",
    status: "active",
    players: [],
    teamLogo: "",
    createdAt: new Date(),
  },
  {
    teamName: "Bangalore Khatri Challengers",
    shortName: "BKC",
    status: "active",
    players: [],
    teamLogo: "",
    createdAt: new Date(),
  },
  {
    teamName: "Gujarat khatri Titans",
    shortName: "GKT",
    status: "active",
    players: [],
    teamLogo: "",
    createdAt: new Date(),
  },
  {
    teamName: "Punjab Khatri Kings",
    shortName: "PKK",
    status: "active",
    players: [],
    teamLogo: "",
    createdAt: new Date(),
  },
  {
    teamName: "Delhi khatri Capitals",
    shortName: "DKC",
    status: "active",
    players: [],
    teamLogo: "",
    createdAt: new Date(),
  },
  {
    teamName: "Lucknow Khatri Giants",
    shortName: "LKG",
    status: "active",
    players: [],
    teamLogo: "",
    createdAt: new Date(),
  },
];

async function seedTeams() {
  const client = new MongoClient(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    tls: true,
    tlsAllowInvalidCertificates: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(MONGO_DB);
    const collection = db.collection("cricket_auction_teams");

    // Insert all teams
    const result = await collection.insertMany(teams);
    console.log(`Successfully inserted ${result.insertedCount} teams:`);

    teams.forEach((team, index) => {
      console.log(`  - ${team.teamName} (${team.shortName})`);
    });
  } catch (error) {
    console.error("Error seeding teams:", error);
  } finally {
    await client.close();
    console.log("\nMongoDB connection closed");
  }
}

seedTeams();
