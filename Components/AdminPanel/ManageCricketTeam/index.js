import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Form,
} from "react-bootstrap";
import { auth, db } from "../../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import Header from "@/Components/Header";
import Meta from "@/Components/Meta";

export default function ManageCricketTeam() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: "",
    captain: "",
    players: "",
    contact: "",
    status: "active",
  });

  useEffect(() => {
    const checkAuthAndFetchTeams = async (currentUser) => {
      try {
        // Check if user is admin
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || !userSnap.data().isAdmin) {
          router.push("/");
          return;
        }

        // Fetch teams
        const teamsSnap = await getDocs(collection(db, "cricket_teams"));
        const teamsData = teamsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTeams(teamsData);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        router.push("/");
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAuthAndFetchTeams(user);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleEditTeam = async (team) => {
    setIsEditing(true);
    setTeamForm({
      id: team.id,
      name: team.name,
      captain: team.captain,
      players: team.players,
      contact: team.contact,
      status: team.status || "active",
    });
    setShowModal(true);
  };
  const handleDeleteTeam = async (teamId) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await deleteDoc(doc(db, "cricket_teams", teamId));
        setTeams(teams.filter((team) => team.id !== teamId));
      } catch (error) {
        console.error("Error deleting team:", error);
      }
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      const teamRef = doc(db, "cricket_teams", teamForm.id);
      await updateDoc(teamRef, {
        ...teamForm,
        updatedAt: new Date().toISOString(),
      });

      setTeams(
        teams.map((team) =>
          team.id === teamForm.id ? { ...team, ...teamForm } : team
        )
      );

      setShowModal(false);
      setIsEditing(false);
      setTeamForm({
        name: "",
        captain: "",
        players: "",
        contact: "",
        status: "active",
      });
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "cricket_teams"), {
        ...teamForm,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setShowModal(false);
      setTeamForm({
        name: "",
        captain: "",
        players: "",
        contact: "",
        status: "active",
      });

      // Refresh teams list
      const teamsSnap = await getDocs(collection(db, "cricket_teams"));
      const teamsData = teamsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeams(teamsData);
    } catch (error) {
      console.error("Error adding team:", error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Meta />
      <Header />
      <Container className="py-5">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0">Cricket Teams</h2>
              <div className="d-flex gap-3 align-items-center">
                <Badge bg="primary" className="px-3 py-2 rounded-pill">
                  Total Teams: {teams.length}
                </Badge>
                <Button
                  variant="primary"
                  className="rounded-pill px-4"
                  onClick={() => setShowModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  Add Team
                </Button>
              </div>
            </div>

            {teams.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-users fa-3x mb-3"></i>
                <h5>No teams added yet</h5>
                <p>Click the Add Team button to create your first team</p>
              </div>
            ) : (
              <Table responsive hover className="align-middle">
                <Table responsive hover className="align-middle">
                  <thead>
                    <tr>
                      <th className="px-4 py-3">Team Name</th>
                      <th className="px-4 py-3">Captain</th>
                      <th className="px-4 py-3">Players</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr key={team.id}>
                        <td className="px-4 py-3 fw-semibold">{team.name}</td>
                        <td className="px-4 py-3">{team.captain}</td>
                        <td className="px-4 py-3">{team.players}</td>
                        <td className="px-4 py-3">{team.contact}</td>
                        <td className="px-4 py-3">
                          <Badge
                            bg={
                              team.status === "active" ? "success" : "secondary"
                            }
                            className="rounded-pill px-3"
                          >
                            {team.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="rounded-pill"
                              onClick={() => handleEditTeam(team)}
                            >
                              <i className="fas fa-edit me-1"></i>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="rounded-pill"
                              onClick={() => handleDeleteTeam(team.id)}
                            >
                              <i className="fas fa-trash-alt me-1"></i>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Table>
            )}
          </Card.Body>
        </Card>
        <Modal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setIsEditing(false);
            setTeamForm({
              name: "",
              captain: "",
              players: "",
              contact: "",
              status: "active",
            });
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {isEditing ? "Edit Team" : "Add New Cricket Team"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={isEditing ? handleUpdateTeam : handleAddTeam}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Team Name</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={teamForm.name}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, name: e.target.value })
                  }
                  placeholder="Enter team name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Captain Name</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={teamForm.captain}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, captain: e.target.value })
                  }
                  placeholder="Enter captain name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Number of Players</Form.Label>
                <Form.Control
                  type="number"
                  required
                  min="1"
                  max="30"
                  value={teamForm.players}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, players: e.target.value })
                  }
                  placeholder="Enter number of players"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contact Number</Form.Label>
                <Form.Control
                  type="tel"
                  required
                  value={teamForm.contact}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, contact: e.target.value })
                  }
                  placeholder="Enter contact number"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={teamForm.status}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                  setTeamForm({
                    name: "",
                    captain: "",
                    players: "",
                    contact: "",
                    status: "active",
                  });
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? "Update Team" : "Add Team"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </>
  );
}
