// Client-side database helper for MongoDB API
// This provides a similar interface to Firebase Firestore for easier migration

const API_BASE = "/api";

// Users Collection
export const usersDb = {
  // Get all users
  async getAll() {
    const response = await fetch(`${API_BASE}/users`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },

  // Get a single user by ID
  async get(userId) {
    const response = await fetch(`${API_BASE}/users/${userId}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },

  // Create or update a user (merge behavior like Firestore setDoc with merge: true)
  async set(userId, userData, options = { merge: true }) {
    const response = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, _id: userId, uid: userId }),
    });
    if (!response.ok) throw new Error("Failed to create/update user");
    return response.json();
  },

  // Update specific fields of a user
  async update(userId, updateData) {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error("Failed to update user");
    return response.json();
  },

  // Delete a user
  async delete(userId) {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete user");
    return response.json();
  },
};

// Teams Collection
export const teamsDb = {
  // Get all teams with optional status filter
  async getAll(options = {}) {
    let url = `${API_BASE}/teams`;
    const params = new URLSearchParams();
    
    if (options.status) {
      // Support both single status and array of statuses
      if (Array.isArray(options.status)) {
        params.set("status", options.status.join(","));
      } else {
        params.set("status", options.status);
      }
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch teams");
    return response.json();
  },

  // Get a single team by ID
  async get(teamId) {
    const response = await fetch(`${API_BASE}/teams/${teamId}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch team");
    return response.json();
  },

  // Create a new team
  async create(teamData) {
    const response = await fetch(`${API_BASE}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData),
    });
    if (!response.ok) throw new Error("Failed to create team");
    return response.json();
  },

  // Update a team
  async update(teamId, updateData) {
    const response = await fetch(`${API_BASE}/teams/${teamId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error("Failed to update team");
    return response.json();
  },

  // Delete a team
  async delete(teamId) {
    const response = await fetch(`${API_BASE}/teams/${teamId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete team");
    return response.json();
  },

  // Find teams by captain phone number
  async findByCaptainPhone(phoneNumber) {
    const teams = await this.getAll();
    return teams.filter((team) => team.captainPhoneNumber === phoneNumber);
  },

  // Find teams by vice captain phone number
  async findByViceCaptainPhone(phoneNumber) {
    const teams = await this.getAll();
    return teams.filter((team) => team.viceCaptainPhoneNumber === phoneNumber);
  },

  // Find team containing a player with given phone number
  async findByPlayerPhone(phoneNumber) {
    const teams = await this.getAll();
    for (const team of teams) {
      const player = team.players?.find((p) => p.phoneNumber === phoneNumber);
      if (player) {
        return { team, player };
      }
    }
    return null;
  },
};

// Matches Collection
export const matchesDb = {
  // Get all matches with optional sorting
  async getAll(options = {}) {
    let url = `${API_BASE}/matches`;
    const params = new URLSearchParams();
    
    if (options.orderBy) {
      params.set("orderBy", options.orderBy);
      params.set("orderDir", options.orderDir || "asc");
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch matches");
    return response.json();
  },

  // Get a single match by ID
  async get(matchId) {
    const response = await fetch(`${API_BASE}/matches/${matchId}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch match");
    return response.json();
  },

  // Create a new match
  async create(matchData) {
    const response = await fetch(`${API_BASE}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(matchData),
    });
    if (!response.ok) throw new Error("Failed to create match");
    return response.json();
  },

  // Update a match
  async update(matchId, updateData) {
    const response = await fetch(`${API_BASE}/matches/${matchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error("Failed to update match");
    return response.json();
  },

  // Delete a match
  async delete(matchId) {
    const response = await fetch(`${API_BASE}/matches/${matchId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete match");
    return response.json();
  },
};

// Export a combined db object for convenience
export const db = {
  users: usersDb,
  teams: teamsDb,
  matches: matchesDb,
};

export default db;
