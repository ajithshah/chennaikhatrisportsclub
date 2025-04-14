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
  query,
  doc,
  getDoc,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import Header from "@/Components/Header";
import Meta from "@/Components/Meta";
import Select from "react-select";

export default function ManageCricketTeam() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewShowModal, setViewShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableCaptains, setAvailableCaptains] = useState([]);
  const [viewTeamDetails, setViewTeamDetails] = useState(null);
  const [teamForm, setTeamForm] = useState({
    teamame: "",
    captain: "",
    phoneNumber: "",
    status: "active",
    email: "",
  });

  useEffect(() => {
    const checkAuthAndFetchData = async (currentUser) => {
      try {
        // Check if user is admin
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || !userSnap.data().isAdmin) {
          router.push("/");
          return;
        }

        // Fetch teams and captains in parallel
        await Promise.all([
          fetchAvailableCaptains(),
          getDocs(collection(db, "cricket_teams")).then((teamsSnap) => {
            const teamsData = teamsSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setTeams(teamsData);
          }),
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        router.push("/");
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAuthAndFetchData(user);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchAvailableCaptains = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const captains = usersSnap.docs
        .map((doc) => ({
          id: doc.id,
          name: doc.data().name || doc.data().displayName,
          phoneNumber: doc.data().phoneNumber,
          email: doc.data().email,
        }))
        .filter((captain) => captain.phoneNumber); // Only include users with phone numbers

      setAvailableCaptains(captains);
    } catch (error) {
      console.error("Error fetching captains:", error);
    }
  };

  const handleEditTeam = async (team) => {
    setIsEditing(true);
    setTeamForm({
      id: team.id,
      name: team.name,
      captain: team.captain,
      status: team.status || "active",
      phoneNumber: team.phoneNumber,
      email: team.email,
    });
    setShowModal(true);
  };
  const handleDeleteTeam = async (teamId) => {
    try {
      // First get the team document to check for members
      const teamRef = doc(db, "cricket_teams", teamId);
      const teamSnap = await getDoc(teamRef);

      if (!teamSnap.exists()) {
        console.error("Team not found");
        return;
      }

      const teamData = teamSnap.data();

      // Check if team has members
      if (teamData.players && teamData.players.length > 0) {
        alert(
          "Cannot delete team with existing members. Please remove all members first."
        );
        return;
      }

      // If no members, proceed with deletion after confirmation
      if (window.confirm("Are you sure you want to delete this team?")) {
        await deleteDoc(teamRef);
        setTeams(teams.filter((team) => team.id !== teamId));
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Error deleting team. Please try again.");
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
        phoneNumber: "",
        email: "",
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setShowModal(false);
      setTeamForm({
        name: "",
        captain: "",
        phoneNumber: "",
        email: "",
        status: "",
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

  const handleViewTeam = async (teamId) => {
    try {
      const teamRef = doc(db, "cricket_teams", teamId);
      const teamSnap = await getDoc(teamRef);

      if (teamSnap.exists()) {
        const teamData = teamSnap.data();
        setViewTeamDetails(teamData);

        // Get players array from team document
        const players = teamData.players || [];

        // Transform players data to match the expected format
        const membersData = players.map((player, index) => ({
          id: index.toString(), // Generate an id since it's an array
          name: player.name,
          role: player.isCaptain
            ? "Captain"
            : player.isViceCaptain
            ? "Vice Captain"
            : "Player",
          jerseyNumber: player.jerseyNumber,
          jerseyName: player.jerseyName,
          jerseySize: player.jerseySize,
          phoneNumber: player.phoneNumber,
        }));

        setTeamMembers(membersData);
        setViewShowModal(true);
      }
    } catch (error) {
      console.error("Error viewing team:", error);
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
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="fw-bold mb-0">Cricket Teams</h2>
              <div className="d-flex align-items-center">
                <Badge
                  bg="primary"
                  className="px-4 py-3 rounded-pill text-light text-center"
                  style={{
                    width: "100%",
                    maxWidth: "200px",
                  }}
                >
                  Total Team: {teams.length}
                </Badge>
                <Button
                  variant="primary"
                  className="rounded-pill px-3 ml-2"
                  onClick={() => setShowModal(true)}
                >
                  {/* <i className="fas fa-plus me-2"></i> */}
                </Button>
              </div>
            </div>

            {teams.length === 0 ? (
              <div className="text-center py-5 text-muted">
                {/* <i className="fas fa-users fa-3x mb-3"></i> */}
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
                        <td className="px-4 py-3">{team.phoneNumber}</td>
                        <td className="px-4 py-3">
                          <Badge
                            bg={
                              team.status === "active" ? "success" : "secondary"
                            }
                            className="rounded-pill px-3 text-light"
                          >
                            {team.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-success"
                              className="rounded-pill"
                              onClick={() => handleViewTeam(team.id)}
                            >
                              {/* <i className="bi-view-list me-1"></i> */}
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="rounded-pill ml-2"
                              onClick={() => handleEditTeam(team)}
                            >
                              {/* <i className="fas fa-edit me-1"></i> */}
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="rounded-pill ml-2"
                              onClick={() => handleDeleteTeam(team.id)}
                            >
                              {/* <i className="fas fa-trash-alt me-1"></i> */}
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
              phoneNumber: "",
              status: "active",
              email: "",
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
              <Form.Group className="formGroup">
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
              <Form.Group className="formGroup">
                <Form.Label>Captain</Form.Label>
                <Select
                  required
                  value={availableCaptains.find(
                    (c) => c.name === teamForm.captain
                  )}
                  onChange={(selected) =>
                    setTeamForm({
                      ...teamForm,
                      captain: selected ? selected.name : "",
                      phoneNumber: selected ? selected.phoneNumber : null,
                      email: selected ? selected.email : null,
                    })
                  }
                  options={availableCaptains.map((captain) => ({
                    value: captain.id,
                    label: `${captain.name} ${
                      captain.phoneNumber ? `(${captain.phoneNumber})` : ""
                    }`,
                    name: captain.name,
                    phoneNumber: captain.phoneNumber,
                    email: captain.email,
                  }))}
                  placeholder="Search and select captain..."
                  isSearchable
                  className="basic-single"
                  classNamePrefix="select"
                />
                <Form.Text className="text-muted">
                  Search and select from registered users
                </Form.Text>
              </Form.Group>

              <Form.Group className="formGroup">
                <Form.Label>Captain Name</Form.Label>
                <Form.Control
                  type="text"
                  required
                  disabled={true}
                  value={teamForm.captain}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, captain: e.target.value })
                  }
                  placeholder="Captain will be auto-filled"
                />
              </Form.Group>
              <Form.Group className="formGroup">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="text"
                  required
                  disabled={true}
                  value={teamForm.email}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, email: e.target.value })
                  }
                  placeholder="Email will be auto-filled"
                />
              </Form.Group>
              <Form.Group className="formGroup">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={teamForm.phoneNumber}
                  disabled={true}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, phoneNumber: e.target.value })
                  }
                  placeholder="Contact number will be auto-filled"
                />
              </Form.Group>
              <Form.Group className="formGroup">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={teamForm.status}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="freeze">Freeze</option>
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
                    phoneNumber: "",
                    status: "active",
                    email: "",
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
        <Modal
          show={viewShowModal}
          onHide={() => {
            setViewShowModal(false);
            setViewTeamDetails(null);
            setTeamMembers([]);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Team Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {viewTeamDetails && (
              <>
                <h5>Team Name: {viewTeamDetails.name}</h5>
                <hr />
                <h6 className="mb-3">Team Members</h6>
                {teamMembers.length > 0 ? (
                  <Table responsive size="sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Contact</th>
                        <th>Jersey Name</th>
                        <th>Jersey Number</th>
                        <th>Jersey Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member) => (
                        <tr key={member.id}>
                          <td>{member.name}</td>
                          <td>{member.role}</td>
                          <td>{member.phoneNumber}</td>
                          <td>{member.jerseyName}</td>
                          <td>{member.jerseyNumber}</td>
                          <td>{member.jerseySize}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-muted">No team members added yet.</p>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setViewShowModal(false)}
              className="bg-primary"
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}
