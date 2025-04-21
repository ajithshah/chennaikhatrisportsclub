"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Modal,
  Form,
  Spinner,
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
import Image from "next/image";
import Header from "@/Components/Header";
import Meta from "@/Components/Meta";
import Select from "react-select";

export default function ManageCricketTeam() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [viewShowModal, setViewShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableCaptains, setAvailableCaptains] = useState([]);
  const [viewTeamDetails, setViewTeamDetails] = useState(null);
  const [file, setFile] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: "",
    captain: "",
    viceCaptain: "",
    captainPhoneNumber: "",
    viceCaptainPhoneNumber: "",
    status: "active",
    email: "",
    players: [],
    teamLogoUrl: "",
  });

  useEffect(() => {
    const checkAuthAndFetchData = async (currentUser) => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || !userSnap.data().isAdmin) {
          router.push("/");
          return;
        }

        await fetchAvailableCaptains();

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
        .filter((captain) => captain.phoneNumber);

      setAvailableCaptains(captains);
    } catch (error) {
      console.error("Error fetching captains:", error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTeamForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Fixed handleFileChange function to use consistent parameter and prevent errors
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const validateForm = () => {
    // Basic validation for captain and vice-captain
    if (
      !teamForm.captain ||
      !teamForm.viceCaptain ||
      teamForm.captain === teamForm.viceCaptain
    ) {
      alert(
        "Captain and Vice-Captain cannot be the same person and must be selected."
      );
      return false;
    }

    // Check if the selected players are already in other teams
    if (!isEditing) {
      // For new team creation

      // Check if captain is already assigned to any team
      const existingCaptainTeam = teams.find(
        (team) => team.captain === teamForm.captain
      );
      if (existingCaptainTeam) {
        alert(
          `Captain ${teamForm.captain} is already assigned to another team. Please select a different captain.`
        );
        return false;
      }

      // Check if vice-captain is already assigned to any team
      const existingViceCaptainTeam = teams.find(
        (team) =>
          team.viceCaptain === teamForm.viceCaptain ||
          team.captain === teamForm.viceCaptain ||
          team.players.some((player) => player.name === teamForm.viceCaptain)
      );
      if (existingViceCaptainTeam) {
        alert(
          `Vice-Captain ${teamForm.viceCaptain} is already assigned to another team. Please select a different vice-captain.`
        );
        return false;
      }

      // Check for other team members (if any are being added)
      if (teamForm.players && teamForm.players.length > 2) {
        const additionalPlayers = teamForm.players.filter(
          (player) => !player.isCaptain && !player.isViceCaptain
        );

        for (const player of additionalPlayers) {
          const existingPlayerTeam = teams.find(
            (team) =>
              team.captain === player.name ||
              team.viceCaptain === player.name ||
              team.players.some((p) => p.name === player.name)
          );

          if (existingPlayerTeam) {
            alert(
              `Player ${player.name} is already assigned to another team. Please select unique players.`
            );
            return false;
          }
        }
      }
    } else {
      // For team editing

      // Check if captain is already assigned to a different team
      const existingCaptainTeam = teams.find(
        (team) => team.captain === teamForm.captain && team.id !== teamForm.id
      );
      if (existingCaptainTeam) {
        alert(
          `Captain ${teamForm.captain} is already assigned to another team. Please select a different captain.`
        );
        return false;
      }

      // Check if vice-captain is already assigned to a different team
      const existingViceCaptainTeam = teams.find(
        (team) =>
          (team.viceCaptain === teamForm.viceCaptain ||
            team.captain === teamForm.viceCaptain ||
            team.players.some(
              (player) =>
                player.name === teamForm.viceCaptain &&
                player.role !== "Vice Captain"
            )) &&
          team.id !== teamForm.id
      );
      if (existingViceCaptainTeam) {
        alert(
          `Vice-Captain ${teamForm.viceCaptain} is already assigned to another team. Please select a different vice-captain.`
        );
        return false;
      }

      // Check for other team members (if any are being added/edited)
      if (teamForm.players && teamForm.players.length > 2) {
        const additionalPlayers = teamForm.players.filter(
          (player) => !player.isCaptain && !player.isViceCaptain
        );

        for (const player of additionalPlayers) {
          // Skip check for players already in this team
          const existingPlayerInCurrentTeam = teams
            .find((team) => team.id === teamForm.id)
            ?.players.some((p) => p.name === player.name);

          if (existingPlayerInCurrentTeam) continue;

          // Check if player exists in other teams
          const existingPlayerTeam = teams.find(
            (team) =>
              (team.captain === player.name ||
                team.viceCaptain === player.name ||
                team.players.some((p) => p.name === player.name)) &&
              team.id !== teamForm.id
          );

          if (existingPlayerTeam) {
            alert(
              `Player ${player.name} is already assigned to another team. Please select unique players.`
            );
            return false;
          }
        }
      }
    }

    return true;
  };
  const handleAddTeam = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error("You must be logged in to add a team.");
    }

    let teamLogoUrl = null;

    try {
      if (file) {
        console.log("File selected:", file);

        const formData = new FormData();
        formData.append("file", file);

        // Fixed fetch call to handle SSL certificate issues
        const uploadUrlResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          // Skip certificate validation in development
          agent:
            process.env.NODE_ENV === "development"
              ? { rejectUnauthorized: false }
              : undefined,
        });

        const urlData = await uploadUrlResponse.json();
        if (!uploadUrlResponse.ok) {
          throw new Error(
            urlData.error || `HTTP error: ${uploadUrlResponse.status}`
          );
        }
        teamLogoUrl = urlData.fileUrl;
      }

      const newTeam = {
        ...teamForm,
        players: [
          {
            name: teamForm.captain,
            isCaptain: true,
            isViceCaptain: false,
            phoneNumber: teamForm.captainPhoneNumber,
            jerseyNumber: "",
            jerseyName: "",
            jerseySize: "",
            role: "Captain",
            userId:
              availableCaptains.find(
                (captain) => captain.name === teamForm.captain
              )?.id || "",
          },
          {
            name: teamForm.viceCaptain,
            isCaptain: false,
            isViceCaptain: true,
            phoneNumber: teamForm.viceCaptainPhoneNumber,
            jerseyNumber: "",
            jerseyName: "",
            jerseySize: "",
            role: "Vice Captain",
            userId:
              availableCaptains.find(
                (captain) => captain.name === teamForm.viceCaptain
              )?.id || "",
          },
        ],
        teamLogoUrl: teamLogoUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save newTeam to database (e.g., Firestore)
      const docRef = await addDoc(collection(db, "cricket_teams"), newTeam);
      setTeams([...teams, { id: docRef.id, ...newTeam }]);

      // Close modal and reset form (if applicable)
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error adding team:", error);
      alert(`Error adding team: ${error.message}`);
    }
  };

  const handleEditTeam = async (team) => {
    setIsEditing(true);
    setTeamForm({
      id: team.id,
      name: team.name,
      captain: team.captain,
      viceCaptain: team.viceCaptain || "",
      captainPhoneNumber: team.captainPhoneNumber || "",
      viceCaptainPhoneNumber: team.viceCaptainPhoneNumber || "",
      status: team.status || "active",
      email: team.email || "",
      players: team.players || [],
      teamLogoUrl: team.teamLogoUrl,
    });
    setShowModal(true);
    setPreview(team.teamLogoUrl);
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let teamLogoUrl = teamForm.teamLogoUrl;
    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        // Fixed fetch call to handle SSL certificate issues
        const uploadUrlResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          // Skip certificate validation in development
          agent:
            process.env.NODE_ENV === "development"
              ? { rejectUnauthorized: false }
              : undefined,
        });

        const urlData = await uploadUrlResponse.json();
        if (!uploadUrlResponse.ok) {
          throw new Error(
            urlData.error || `HTTP error: ${uploadUrlResponse.status}`
          );
        }
        teamLogoUrl = urlData.fileUrl;
      }

      // Update player roles in the players array
      const updatedPlayers = teamForm.players.map((player) => {
        if (player.name === teamForm.captain) {
          return {
            ...player,
            isCaptain: true,
            isViceCaptain: false,
            role: "Captain",
            phoneNumber: teamForm.captainPhoneNumber,
          };
        } else if (player.name === teamForm.viceCaptain) {
          return {
            ...player,
            isCaptain: false,
            isViceCaptain: true,
            role: "Vice Captain",
            phoneNumber: teamForm.viceCaptainPhoneNumber,
          };
        }
        return player;
      });

      const teamRef = doc(db, "cricket_teams", teamForm.id);
      const updateData = {
        name: teamForm.name,
        captain: teamForm.captain,
        viceCaptain: teamForm.viceCaptain,
        captainPhoneNumber: teamForm.captainPhoneNumber,
        viceCaptainPhoneNumber: teamForm.viceCaptainPhoneNumber,
        status: teamForm.status,
        email: teamForm.email,
        players: updatedPlayers,
        updatedAt: new Date().toISOString(),
        teamLogoUrl: teamLogoUrl,
      };

      await updateDoc(teamRef, updateData);

      setTeams(
        teams.map((team) =>
          team.id === teamForm.id ? { ...team, ...updateData } : team
        )
      );

      setShowModal(false);
      setIsEditing(false);
      resetForm();
    } catch (error) {
      console.error("Error updating team:", error);
      alert("Error updating team: " + error.message);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      const teamRef = doc(db, "cricket_teams", teamId);
      const teamSnap = await getDoc(teamRef);

      if (!teamSnap.exists()) {
        console.error("Team not found");
        return;
      }

      const teamData = teamSnap.data();

      if (teamData.players && teamData.players.length > 2) {
        // Allow deletion if only captain and vice-captain exist
        alert(
          "Cannot delete team with existing members. Please remove all members first."
        );
        return;
      }

      if (window.confirm("Are you sure you want to delete this team?")) {
        await deleteDoc(teamRef);
        setTeams(teams.filter((team) => team.id !== teamId));
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Error deleting team. Please try again.");
    }
  };

  const handleViewTeam = async (teamId) => {
    try {
      const teamRef = doc(db, "cricket_teams", teamId);
      const teamSnap = await getDoc(teamRef);

      if (teamSnap.exists()) {
        const teamData = teamSnap.data();
        setViewTeamDetails(teamData);

        const membersData = teamData.players.map((player, index) => ({
          id: index.toString(),
          name: player.name,
          role: player.isCaptain
            ? "Captain"
            : player.isViceCaptain
            ? "Vice Captain"
            : player.role || "Player",
          jerseyNumber: player.jerseyNumber || "",
          jerseyName: player.jerseyName || "",
          jerseySize: player.jerseySize || "",
          phoneNumber: player.phoneNumber || "",
        }));

        setTeamMembers(membersData);
        setViewShowModal(true);
      }
    } catch (error) {
      console.error("Error viewing team:", error);
      alert("Error viewing team: " + error.message);
    }
  };

  const resetForm = () => {
    setTeamForm({
      name: "",
      captain: "",
      viceCaptain: "",
      captainPhoneNumber: "",
      viceCaptainPhoneNumber: "",
      status: "active",
      email: "",
      players: [],
      teamLogoUrl: "",
    });
    setFile(null);
    setPreview(null);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden"></span>
        </Spinner>
      </Container>
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
                  bg="success"
                  className="px-4 py-3 rounded-pill text-light text-center"
                  style={{ width: "100%", maxWidth: "200px" }}
                >
                  Total Team: {teams.length}
                </Badge>
                <Button
                  variant="primary"
                  className="rounded-pill px-3 ms-2 ml-2"
                  onClick={() => setShowModal(true)}
                >
                  <i className="fas fa-plus"></i>
                </Button>
              </div>
            </div>

            {teams.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-users fa-3x mb-3"></i>
                <h5>No teams added yet</h5>
                <p>Click the + button to create your first team</p>
              </div>
            ) : (
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th className="px-4 py-3">Logo</th>
                    <th className="px-4 py-3">Team Name</th>
                    <th className="px-4 py-3">C/VC</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id}>
                      <td className="px-4 py-3 fw-semibold">
                        {team.teamLogoUrl ? (
                          <Image
                            src={team.teamLogoUrl}
                            width={50}
                            height={50}
                            className="rounded-circle img-fluid"
                            alt={`${team.name}'s logo`}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-secondary"
                            style={{ width: "50px", height: "50px" }}
                          ></div>
                        )}
                      </td>
                      <td className="px-4 py-3 fw-semibold">{team.name}</td>
                      <td className="px-4 py-3">
                        {team.captain}
                        <br></br>
                        {team.viceCaptain}
                      </td>
                      <td className="px-4 py-3">
                        {team.captainPhoneNumber}
                        <br></br>
                        {team.viceCaptainPhoneNumber}
                      </td>
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
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="rounded-pill ms-2"
                            onClick={() => handleEditTeam(team)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="rounded-pill ms-2"
                            onClick={() => handleDeleteTeam(team.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
        <Modal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setIsEditing(false);
            resetForm();
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {isEditing ? "Edit Team" : "Add New Cricket Team"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={isEditing ? handleUpdateTeam : handleAddTeam}>
            <Modal.Body>
              <Form.Group className="formGroup mb-3">
                <Form.Label>Team Name</Form.Label>
                <Form.Control
                  type="text"
                  required
                  name="name"
                  value={teamForm.name}
                  onChange={handleFormChange}
                  placeholder="Enter team name"
                />
              </Form.Group>
              <Form.Group className="formGroup mb-3">
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
                      captainPhoneNumber: selected ? selected.phoneNumber : "",
                      email: selected ? selected.email : "",
                    })
                  }
                  options={availableCaptains.map((captain) => ({
                    value: captain.id,
                    label: `${captain.name} (${captain.phoneNumber})`,
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

              {teamForm.captain && (
                <Form.Group className="formGroup mb-3">
                  <Form.Label>Selected Captain</Form.Label>
                  <Form.Control type="text" value={teamForm.captain} readOnly />
                </Form.Group>
              )}
              <Form.Group className="formGroup mb-3">
                <Form.Label>Vice-Captain</Form.Label>
                <Select
                  required
                  value={availableCaptains.find(
                    (c) => c.name === teamForm.viceCaptain
                  )}
                  onChange={(selected) =>
                    setTeamForm({
                      ...teamForm,
                      viceCaptain: selected ? selected.name : "",
                      viceCaptainPhoneNumber: selected
                        ? selected.phoneNumber
                        : "",
                    })
                  }
                  options={availableCaptains.map((captain) => ({
                    value: captain.id,
                    label: `${captain.name} (${captain.phoneNumber})`,
                    name: captain.name,
                    phoneNumber: captain.phoneNumber,
                    email: captain.email,
                    isDisabled: teamForm.captain === captain.name,
                  }))}
                  placeholder="Search and select vice-captain..."
                  isSearchable
                  className="basic-single"
                  classNamePrefix="select"
                />
                <Form.Text className="text-muted">
                  Search and select from registered users
                </Form.Text>
              </Form.Group>

              {teamForm.viceCaptain && (
                <Form.Group className="formGroup mb-3">
                  <Form.Label>Selected Vice-Captain</Form.Label>
                  <Form.Control
                    type="text"
                    value={teamForm.viceCaptain}
                    readOnly
                  />
                </Form.Group>
              )}

              <Form.Group className="formGroup mb-3">
                <Form.Label>Team Logo</Form.Label>
                <Form.Control
                  type="file"
                  name="file"
                  className="form-control"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                />
                <Form.Text className="text-muted">
                  Upload a team logo (JPEG, PNG, or JPG). Max 10 MB.
                </Form.Text>
                {preview && (
                  <div className="mt-3">
                    <img
                      src={preview}
                      width={100}
                      height={100}
                      alt="Team Logo Preview"
                      className="img-thumbnail"
                    />
                  </div>
                )}
              </Form.Group>
              <Form.Group className="formGroup mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={teamForm.status}
                  onChange={handleFormChange}
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
                  resetForm();
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
        {/* View Team Details */}
        <Modal
          show={viewShowModal}
          onHide={() => {
            setViewShowModal(false);
            setViewTeamDetails(null);
            setTeamMembers([]);
          }}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Team Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {viewTeamDetails && (
              <Container className="p-3">
                <h5 className="text-success fw-bold">
                  Team Name: {viewTeamDetails.name}
                </h5>
                {viewTeamDetails.teamLogoUrl && (
                  <div className="mb-3">
                    <Image
                      src={viewTeamDetails.teamLogoUrl}
                      width={150}
                      height={150}
                      alt="Team Logo"
                      className="img-fluid"
                    />
                  </div>
                )}
                <hr />
                <h6 className="mb-3">Team Members</h6>
                {teamMembers.length > 0 ? (
                  <Table responsive="sm" striped variant="light">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Contact</th>
                        <th>Jersey Name</th>
                        <th>Jersey No</th>
                        <th>Jersey Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member) => (
                        <tr key={member.id}>
                          <td>{member.name}</td>
                          <td>{member.role}</td>
                          <td>{member.phoneNumber}</td>
                          <td>{member.jerseyName || "-"}</td>
                          <td>{member.jerseyNumber || "-"}</td>
                          <td>
                            {member.jerseySize
                              ? member.jerseySize.toUpperCase()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="warning" className="text-center">
                    No team members added yet.
                  </Alert>
                )}
              </Container>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setViewShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}
