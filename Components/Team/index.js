import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Card,
  Row,
  Col,
  Badge,
  Table,
  Button,
  Modal,
  Spinner,
  Form,
} from "react-bootstrap";
import Select from "react-select";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import Meta from "@/Components/Meta";

export default function Team() {
  const router = useRouter();
  const { id } = router.query;
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editingPlayerIndex, setEditingPlayerIndex] = useState(null);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "",
    userId: "",
    phoneNumber: "",
    isCaptain: false,
    isViceCaptain: false,
  });

  // Fetch team data
  const fetchTeamData = async () => {
    if (!id) return;

    try {
      const teamRef = doc(db, "cricket_teams", id);
      const teamSnap = await getDoc(teamRef);

      if (teamSnap.exists()) {
        setTeamData({ id: teamSnap.id, ...teamSnap.data() });
      } else {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error fetching team:", error);
      router.push("/profile");
    }
  };

  // Fetch available players from users collection
  const fetchAvailablePlayers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const players = usersSnap.docs
        .map((doc) => ({
          id: doc.id,
          name: doc.data().displayName || doc.data().name,
          email: doc.data().email,
          phoneNumber: doc.data().phoneNumber,
        }))
        .filter((player) => player.phoneNumber); // Only include players with phone numbers

      setAvailablePlayers(players);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.role || !newPlayer.userId) return;

    // Check if player already exists in team
    if (
      teamData?.players?.some((player) => player.userId === newPlayer.userId)
    ) {
      alert("This player is already in the team!");
      return;
    }
    // Check if team has reached maximum number of players
    if (teamData?.players?.length >= 15) {
      alert("You can only add up to 15 players to the team!");
      return;
    }

    try {
      const teamRef = doc(db, "cricket_teams", id);
      const players = teamData.players || [];

      const playerData = {
        name: newPlayer.name,
        role: newPlayer.role,
        userId: newPlayer.userId,
        phoneNumber: newPlayer.phoneNumber,
        isCaptain: newPlayer.isCaptain,
        isViceCaptain: newPlayer.isViceCaptain,
        jerseyNumber: newPlayer.jerseyNumber,
        jerseyName: newPlayer.jerseyName,
        jerseySize: newPlayer.jerseySize,
      };

      // Update team data
      await updateDoc(teamRef, {
        players: [...players, playerData],
      });

      // Update local state
      setTeamData({
        ...teamData,
        players: [...players, playerData],
      });

      // Reset form
      setNewPlayer({
        name: "",
        role: "",
        userId: "",
        phoneNumber: "",
        isCaptain: false,
        isViceCaptain: false,
        jerseyNumber: "",
        jerseyName: "",
        jerseySize: "",
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error adding player:", error);
    }
  };

  // Handle removing player
  const handleRemovePlayer = async (index) => {
    if (!window.confirm("Are you sure you want to remove this player?")) return;

    try {
      const teamRef = doc(db, "cricket_teams", id);
      const players = [...teamData.players];
      players.splice(index, 1);

      await updateDoc(teamRef, { players });
      setTeamData({ ...teamData, players });
    } catch (error) {
      console.error("Error removing player:", error);
    }
  };

  // const handleEditTeam = async (e) => {
  //   e.preventDefault();
  //   if (!editTeam.name || !editTeam.phoneNumber || !editTeam.status) return;

  //   try {
  //     const teamRef = doc(db, "cricket_teams", id);
  //     await updateDoc(teamRef, {
  //       name: editTeam.name,
  //       phoneNumber: editTeam.phoneNumber,
  //       status: editTeam.status,
  //       jerseyNumber: editTeam.jerseyNumber,
  //       jerseyName: editTeam.jerseyName,
  //       jerseySize: editTeam.jerseySize,
  //       role: editTeam.role,
  //       isCaptain: editTeam.isCaptain,
  //       isViceCaptain: editTeam.isViceCaptain,
  //     });

  //     // Update local state
  //     setTeamData({
  //       ...teamData,
  //       name: editTeam.name,
  //       phoneNumber: editTeam.phoneNumber,
  //       status: editTeam.status,
  //       jerseyNumber: editTeam.jerseyNumber,
  //       jerseyName: editTeam.jerseyName,
  //       jerseySize: editTeam.jerseySize,
  //       role: editTeam.role,
  //       isCaptain: editTeam.isCaptain,
  //       isViceCaptain: editTeam.isViceCaptain,
  //     });

  //     setShowEditModal(false);
  //   } catch (error) {
  //     console.error("Error updating team:", error);
  //   }
  // };

  const handleEditPlayer = (index) => {
    const player = teamData.players[index];
    setEditingPlayer({
      name: player.name,
      role: player.role,
      userId: player.userId,
      phoneNumber: player.phoneNumber,
      isCaptain: player.isCaptain,
      isViceCaptain: player.isViceCaptain,
      jerseyNumber: player.jerseyNumber || "",
      jerseyName: player.jerseyName || "",
      jerseySize: player.jerseySize || "",
    });
    setEditingPlayerIndex(index);
    setShowEditModal(true);
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        await Promise.all([fetchTeamData(), fetchAvailablePlayers()]);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden"></span>
        </Spinner>
      </Container>
    );
  }

  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    if (!editingPlayer.role) return;

    try {
      const teamRef = doc(db, "cricket_teams", id);
      const updatedPlayers = [...teamData.players];

      // If making this player captain, remove captain status from others
      if (editingPlayer.isCaptain) {
        updatedPlayers.forEach((player, idx) => {
          if (idx !== editingPlayerIndex) {
            player.isCaptain = false;
          }
        });
      }

      // If making this player vice captain, remove vice captain status from others
      if (editingPlayer.isViceCaptain) {
        updatedPlayers.forEach((player, idx) => {
          if (idx !== editingPlayerIndex) {
            player.isViceCaptain = false;
          }
        });
      }

      updatedPlayers[editingPlayerIndex] = {
        ...updatedPlayers[editingPlayerIndex],
        ...editingPlayer,
      };

      await updateDoc(teamRef, { players: updatedPlayers });

      setTeamData({
        ...teamData,
        players: updatedPlayers,
      });

      setShowEditModal(false);
      setEditingPlayer(null);
      setEditingPlayerIndex(null);
    } catch (error) {
      console.error("Error updating player:", error);
    }
  };

  return (
    <>
      <Meta title={`Team - ${teamData?.name || "Loading..."}`} />
      <Container className="py-5">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            {/* Team Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0">Team : {teamData?.name}</h2>
              <Badge
                bg={
                  teamData?.status === "active"
                    ? "success"
                    : teamData?.status === "inactive"
                    ? "danger"
                    : "warning"
                }
                className="px-5 py-2 rounded-pill text-light"
              >
                {teamData?.status}
              </Badge>
            </div>

            {/* Team Info */}
            <Row className="mb-4">
              <Col md={6}>
                <div className="d-flex align-items-center mb-3">
                  <div className="text-muted" style={{ width: "140px" }}>
                    Team Captain:
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div>{teamData?.captain}</div>
                    <Badge
                      bg="primary ml-2"
                      className="rounded-pill text-light"
                    >
                      C
                    </Badge>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="text-muted" style={{ width: "140px" }}>
                    Contact:
                  </div>
                  <div>{teamData?.captainPhoneNumber}</div>
                </div>
              </Col>
            </Row>

            {/* Players Section */}
            {teamData?.status === "active" && (
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Team Players</h4>
                <Button
                  variant="primary"
                  className="rounded-pill"
                  onClick={() => setShowModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  Add Player
                </Button>
              </div>
            )}

            {/* Players Table */}
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Jersey Name</th>
                  <th>Jersey Number</th>
                  <th>Jersey Size</th>
                  {teamData?.status === "active" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {teamData?.players?.map((player, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {player.name}
                        {player.isCaptain && (
                          <Badge
                            bg="primary ml-2"
                            className="rounded-pill text-light"
                          >
                            C
                          </Badge>
                        )}
                        {player.isViceCaptain && (
                          <Badge
                            bg="primary ml-2"
                            className="rounded-pill text-light"
                          >
                            VC
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      {
                        availablePlayers.find((p) => p.id === player.userId)
                          ?.phoneNumber
                      }
                    </td>
                    <td>{player.role}</td>

                    <td>{player.jerseyName}</td>
                    <td>{player.jerseyNumber}</td>
                    <td>{player.jerseySize.toUpperCase()}</td>
                    <td>
                      {teamData?.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline-success"
                            className="rounded-pill"
                            onClick={() => handleEditPlayer(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm ml-2"
                            variant="outline-danger"
                            className="rounded-pill"
                            onClick={() => handleRemovePlayer(index)}
                          >
                            Remove
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {(!teamData?.players || teamData.players.length === 0) && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No players added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Add Player Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header>
            <Modal.Title>Add New Player</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddPlayer}>
            <Modal.Body>
              <Form.Group className="mb-3 formGroup">
                <Form.Label>Select Player</Form.Label>
                <Select
                  value={availablePlayers.find(
                    (p) => p.id === newPlayer.userId // Changed from name comparison to userId
                  )}
                  Contact
                  onChange={(selected) =>
                    setNewPlayer({
                      ...newPlayer,
                      name: selected?.name || "",
                      userId: selected?.value || "",
                      phoneNumber: selected?.phoneNumber || "",
                      jerseyNumber: selected?.jerseyNumber || "",
                      jerseyName: selected?.jerseyName || "",
                      jerseySize: selected?.jerseySize || "",
                      role: selected?.role || "",
                      isCaptain: selected?.isCaptain || false,
                      isViceCaptain: selected?.isViceCaptain || false,
                    })
                  }
                  options={availablePlayers.map((player) => ({
                    value: player.id,
                    label: `${player.name} ${
                      player.phoneNumber ? `(${player.phoneNumber})` : ""
                    }`,
                    name: player.name,
                    phoneNumber: player.phoneNumber,
                  }))}
                  placeholder="Search and select player..."
                  isSearchable
                  isClearable
                  className="basic-single"
                  classNamePrefix="select"
                />
              </Form.Group>

              <Form.Group className="formGroup">
                <Form.Label>Captain Name</Form.Label>
                <Form.Control
                  type="text"
                  required
                  disabled={true}
                  value={newPlayer.name}
                  placeholder="Captain will be auto-filled"
                />
              </Form.Group>
              <Form.Group className="mb-3 formGroup">
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  type="tel"
                  disabled
                  value={newPlayer.phoneNumber}
                  placeholder="Contact will be auto-filled"
                />
              </Form.Group>
              <Form.Group className="mb-3 formGroup">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  required
                  value={newPlayer.role}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, role: e.target.value })
                  }
                >
                  <option value="">Select role</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicket-keeper">Wicket-keeper</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3 formGroup">
                <Form.Label>Jersey Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Jersey Name"
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, jerseyName: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3 formGroup">
                <Form.Label>Jersey Number</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Jersey Number"
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, jerseyNumber: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3 formGroup">
                <Form.Label>Jersey Size</Form.Label>
                <Form.Select
                  required
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, jerseySize: e.target.value })
                  }
                >
                  <option value="">Select Size</option>
                  <option value="s">S</option>
                  <option value="m">M</option>
                  <option value="l">L</option>
                  <option value="xl">XL</option>
                  <option value="xxl">XXL</option>
                </Form.Select>
              </Form.Group>
              {!teamData?.players?.find((player) => player.isCaptain) && (
                <Form.Group className="mb-3 formGroup">
                  <Form.Check
                    type="checkbox"
                    id="isCaptain"
                    label="Assign as Team Captain"
                    checked={newPlayer.isCaptain}
                    onChange={(e) =>
                      setNewPlayer({
                        ...newPlayer,
                        isCaptain: e.target.checked,
                      })
                    }
                  />
                </Form.Group>
              )}
              {!teamData?.players?.find((player) => player.isViceCaptain) &&
                !newPlayer.isCaptain && (
                  <Form.Group className="mb-3 formGroup">
                    <Form.Check
                      type="checkbox"
                      id="isViceCaptain"
                      label="Assign as Team Vice Captain"
                      checked={newPlayer.isViceCaptain}
                      onChange={(e) =>
                        setNewPlayer({
                          ...newPlayer,
                          isViceCaptain: e.target.checked,
                          isCaptain: false, // Uncheck captain if vice captain is selected
                        })
                      }
                    />
                  </Form.Group>
                )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={!newPlayer.name || !newPlayer.role}
              >
                Add Player
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        {/* Edit Player Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header>
            <Modal.Title>Edit Player</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdatePlayer}>
            <Modal.Body>
              <Form.Group className="mb-3 formGroup">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingPlayer?.name || ""}
                  disabled
                />
              </Form.Group>
              <Form.Group className="mb-3 formGroup">
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  type="text"
                  value={editingPlayer?.phoneNumber || ""}
                  disabled
                />
              </Form.Group>
              <Form.Group className="mb-3 formGroup">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  required
                  value={editingPlayer?.role || ""}
                  onChange={(e) =>
                    setEditingPlayer({ ...editingPlayer, role: e.target.value })
                  }
                >
                  <option value="">Select role</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicket-keeper">Wicket-keeper</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3 formGroup">
                <Form.Label>Jersey Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Jersey Name"
                  value={editingPlayer?.jerseyName || ""}
                  onChange={(e) =>
                    setEditingPlayer({
                      ...editingPlayer,
                      jerseyName: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3 formGroup">
                <Form.Label>Jersey Number</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Jersey Number"
                  value={editingPlayer?.jerseyNumber || ""}
                  onChange={(e) =>
                    setEditingPlayer({
                      ...editingPlayer,
                      jerseyNumber: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3 formGroup">
                <Form.Label>Jersey Size</Form.Label>
                <Form.Select
                  value={editingPlayer?.jerseySize || ""}
                  onChange={(e) =>
                    setEditingPlayer({
                      ...editingPlayer,
                      jerseySize: e.target.value,
                    })
                  }
                >
                  <option value="">Select Size</option>
                  <option value="s">S</option>
                  <option value="m">M</option>
                  <option value="l">L</option>
                  <option value="xl">XL</option>
                  <option value="xxl">XXL</option>
                </Form.Select>
              </Form.Group>
              {(!teamData?.players?.find((p) => p.isCaptain) ||
                editingPlayer?.isCaptain) && (
                <Form.Group className="mb-3 formGroup">
                  <Form.Check
                    type="checkbox"
                    id="editIsCaptain"
                    label="Assign as Team Captain"
                    checked={editingPlayer?.isCaptain || false}
                    onChange={(e) =>
                      setEditingPlayer({
                        ...editingPlayer,
                        isCaptain: e.target.checked,
                        isViceCaptain: e.target.checked
                          ? false
                          : editingPlayer.isViceCaptain,
                      })
                    }
                  />
                </Form.Group>
              )}
              {(!teamData?.players?.find((p) => p.isViceCaptain) ||
                editingPlayer?.isViceCaptain) &&
                !editingPlayer?.isCaptain && (
                  <Form.Group className="mb-3 formGroup">
                    <Form.Check
                      type="checkbox"
                      id="editIsViceCaptain"
                      label="Assign as Team Vice Captain"
                      checked={editingPlayer?.isViceCaptain || false}
                      onChange={(e) =>
                        setEditingPlayer({
                          ...editingPlayer,
                          isViceCaptain: e.target.checked,
                          isCaptain: false,
                        })
                      }
                    />
                  </Form.Group>
                )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update Player
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </>
  );
}
