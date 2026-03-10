import { MongoClient } from "mongodb";

const MONGO_URI =
  "mongodb+srv://chennaikhatrisportsclub:chennaikhatrisportsclub@chennaikhatrisportsclub.x08xczo.mongodb.net/?retryWrites=true&w=majority&appName=chennaikhatrisportsclub";
const MONGO_DB = "chennaikhatrisportsclub";

// Google Sheets config
const SHEET_ID = "1RFcdRX5EiC4DXwvuRkMX-GMUDnLwtxZp8_acPZ6Q25A";
const SHEET_NAME = "Sheet1";

async function fetchFromGoogleSheets() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}&_=${Date.now()}`;

  const response = await fetch(url);
  const text = await response.text();

  // Parse the JSONP response
  const jsonString = text.substring(
    text.indexOf("(") + 1,
    text.lastIndexOf(")"),
  );
  const data = JSON.parse(jsonString);

  if (!data.table || !data.table.rows) {
    return [];
  }

  // Get column headers
  const headers = data.table.cols.map((col) => col.label || "");

  // Map rows to player objects
  const players = data.table.rows
    .map((row, index) => {
      const player = {
        sheetId: index + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      row.c.forEach((cell, colIndex) => {
        const header = headers[colIndex];
        const value = cell
          ? cell.v !== null && cell.v !== undefined
            ? cell.v
            : cell.f || ""
          : "";
        const displayValue = cell
          ? cell.f ||
            (cell.v !== null && cell.v !== undefined ? String(cell.v) : "")
          : "";

        switch (header.toLowerCase().trim()) {
          case "player email id":
            player.email = value;
            break;
          case "player name":
            player.name = value;
            break;
          case "player location":
            player.location = value;
            break;
          case "player mobile number":
            player.mobile = value;
            break;
          case "age of the player":
            player.age = value;
            break;
          case "dob of the player ( select from the calender)":
            player.dob = value;
            break;
          case "player skill":
            player.skill = value;
            break;
          case "player batting style":
            player.battingStyle = value;
            break;
          case "player bowler style":
            player.bowlingStyle = value;
            break;
          case "jersey name":
            player.jerseyName = value;
            break;
          case "jersey number":
            player.jerseyNumber = displayValue || String(value || "");
            break;
          case "jersey size":
            player.jerseySize = value;
            break;
          case "photo of the player":
            player.photoURL = value;
            break;
          case "status":
            player.status = value;
            break;
          case "team":
            player.team = value;
            break;
          default:
            if (header) {
              const key = header.toLowerCase().replace(/[^a-z0-9]/g, "_");
              player[key] = value;
            }
        }
      });

      return player;
    })
    .filter((player) => player.name);

  return players;
}

async function migrateToMongoDB() {
  console.log("Fetching data from Google Sheets...");
  const players = await fetchFromGoogleSheets();
  console.log(`Found ${players.length} players in Google Sheets`);

  if (players.length === 0) {
    console.log("No players to migrate");
    return;
  }

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
    const collection = db.collection("cricket_auction_players");

    // Clear existing data (optional - comment out if you want to keep existing data)
    await collection.deleteMany({});
    console.log("Cleared existing cricket_auction_players collection");

    // Insert all players
    const result = await collection.insertMany(players);
    console.log(
      `\nSuccessfully migrated ${result.insertedCount} players to MongoDB!`,
    );

    console.log("\nMigrated players:");
    players.forEach((player, index) => {
      console.log(
        `  ${index + 1}. ${player.name} - ${player.skill || "N/A"} (${player.status || "N/A"})`,
      );
    });
  } catch (error) {
    console.error("Error migrating data:", error);
  } finally {
    await client.close();
    console.log("\nMongoDB connection closed");
  }
}

migrateToMongoDB();
