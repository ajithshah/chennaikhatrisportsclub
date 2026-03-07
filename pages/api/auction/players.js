// API endpoint to fetch auction players from Google Sheets
const SHEET_ID = "1RFcdRX5EiC4DXwvuRkMX-GMUDnLwtxZp8_acPZ6Q25A";
const SHEET_NAME = "Sheet1"; // Change this if your sheet has a different name

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Disable caching to always get fresh data
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    // Fetch public Google Sheet as JSON using gviz API (with cache buster)
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}&_=${Date.now()}`;
    
    const response = await fetch(url);
    const text = await response.text();
    
    // Parse the JSONP response - Google returns it wrapped in a function call
    const jsonString = text.substring(text.indexOf("(") + 1, text.lastIndexOf(")"));
    const data = JSON.parse(jsonString);
    
    if (!data.table || !data.table.rows) {
      return res.status(200).json({ players: [] });
    }

    // Get column headers from first row
    const headers = data.table.cols.map(col => col.label || "");
    
    // Map rows to player objects
    const players = data.table.rows.map((row, index) => {
      const player = { id: index + 1 };
      
      row.c.forEach((cell, colIndex) => {
        const header = headers[colIndex];
        const value = cell ? (cell.v !== null && cell.v !== undefined ? cell.v : cell.f || "") : "";
        const displayValue = cell ? (cell.f || (cell.v !== null && cell.v !== undefined ? String(cell.v) : "")) : "";
        
        // Map headers to clean property names
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
            // Handle any other columns
            if (header) {
              const key = header.toLowerCase().replace(/[^a-z0-9]/g, "_");
              player[key] = value;
            }
        }
      });
      
      return player;
    }).filter(player => player.name); // Filter out empty rows

    res.status(200).json({ players });
  } catch (error) {
    console.error("Error fetching auction players:", error);
    res.status(500).json({ error: "Failed to fetch players", details: error.message });
  }
}
