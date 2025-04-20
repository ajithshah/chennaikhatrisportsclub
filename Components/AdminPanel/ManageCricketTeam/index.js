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
  const [viewShowModal, setViewShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableCaptains, setAvailableCaptains] = useState([]);
  const [viewTeamDetails, setViewTeamDetails] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: "",
    captain: "",
    viceCaptain: "",
    captainPhoneNumber: "",
    viceCaptainPhoneNumber: "",
    status: "active",
    email: "",
    players: [],
    file: null,
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
        .filter((captain) => captain.phoneNumber);

      setAvailableCaptains(captains);
    } catch (error) {
      console.error("Error fetching captains:", error);
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    try {
      // Validate user authentication
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to add a team.");
      }

      // Validate captain and vice-captain
      if (teamForm.captain === teamForm.viceCaptain) {
        throw new Error("Captain and Vice-Captain cannot be the same person.");
      }

      let fileUrl = null;
      if (teamForm.file) {
        // Log file details
        console.log("File selected for upload:", {
          name: teamForm.file.name,
          type: teamForm.file.type,
          size: teamForm.file.size,
        });

        // Validate file existence and type
        if (!teamForm.file.name) {
          throw new Error("No file selected for upload.");
        }
        if (!/\.(jpe?g|png|gif)$/i.test(teamForm.file.name)) {
          throw new Error("Only JPEG, PNG, or GIF files are allowed.");
        }

        // Request upload URL from /api/blob-upload
        console.log("Requesting upload URL for:", {
          filename: teamForm.file.name,
        });
        const uploadUrlResponse = await fetch("/api/upload", {
          method: "POST",
          body: JSON.stringify({ filename: teamForm.file.name }),
          headers: { "Content-Type": "application/json" },
        });

        // Handle non-JSON responses
        let urlData;
        try {
          urlData = await uploadUrlResponse.json();
        } catch (jsonError) {
          const responseText = await uploadUrlResponse.text();
          console.error("Non-JSON response from /api/upload:", {
            status: uploadUrlResponse.status,
            text: responseText.slice(0, 200),
          });
          throw new Error(
            `Invalid response from upload API: ${uploadUrlResponse.status}`
          );
        }

        // Check for HTTP errors
        if (!uploadUrlResponse.ok) {
          console.error("Upload URL request failed:", {
            status: uploadUrlResponse.status,
            error: urlData.error,
            details: urlData.details,
          });
          throw new Error(
            urlData.error ||
              `Failed to generate upload URL: HTTP ${uploadUrlResponse.status}`
          );
        }

        // Validate response data
        const { url, pathname } = urlData;
        console.log("Received upload URL:", { url, pathname });
        if (!url) {
          console.error("No URL in response:", urlData);
          throw new Error("No upload URL returned");
        }

        // Upload file to Vercel Blob
        console.log("Uploading file to:", url);
        const fileUploadResponse = await fetch(url, {
          method: "PUT",
          body: teamForm.file,
        });

        if (!fileUploadResponse.ok) {
          const errorText = await fileUploadResponse.text();
          console.error("File upload failed:", {
            status: fileUploadResponse.status,
            error: errorText,
          });
          throw new Error(
            `Failed to upload file to Vercel Blob: ${
              errorText || fileUploadResponse.status
            }`
          );
        }

        fileUrl = url;
        console.log("File uploaded successfully:", { fileUrl });
      } else {
        console.log("No file selected for upload.");
      }

      // Create new team object
      const newTeam = {
        name: teamForm.name,
        captain: teamForm.captain,
        viceCaptain: teamForm.viceCaptain,
        captainPhoneNumber: teamForm.captainPhoneNumber,
        viceCaptainPhoneNumber: teamForm.viceCaptainPhoneNumber,
        status: teamForm.status,
        email: teamForm.email,
        players: teamForm.players,
        fileUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      console.log("Saving team to Firestore:", { name: newTeam.name, fileUrl });
      const docRef = await addDoc(collection(db, "cricket_teams"), newTeam);
      setTeams([...teams, { id: docRef.id, ...newTeam }]);

      // Reset form and close modal
      setShowModal(false);
      setTeamForm({
        name: "",
        captain: "",
        viceCaptain: "",
        captainPhoneNumber: "",
        viceCaptainPhoneNumber: "",
        status: "active",
        email: "",
        players: [],
        file: null,
      });
      console.log("Team added successfully:", { id: docRef.id });
    } catch (error) {
      console.error("Error adding team:", {
        message: error.message,
        stack: error.stack,
      });
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
      file: null,
    });
    setShowModal(true);
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      if (teamForm.captain === teamForm.viceCaptain) {
        alert("Captain and Vice-Captain cannot be the same person.");
        return;
      }

      const teamRef = doc(db, "cricket_teams", teamForm.id);
      const updateData = {
        name: teamForm.name,
        captain: teamForm.captain,
        viceCaptain: teamForm.viceCaptain,
        captainPhoneNumber: teamForm.captainPhoneNumber,
        viceCaptainPhoneNumber: teamForm.viceCaptainPhoneNumber,
        status: teamForm.status,
        email: teamForm.email,
        players: teamForm.players,
        updatedAt: new Date().toISOString(),
      };

      if (teamForm.file) {
        // Validate file type client-side
        if (!/\.(jpe?g|png|gif)$/i.test(teamForm.file.name)) {
          alert("Only JPEG, PNG, or GIF files are allowed.");
          return;
        }

        // Client-side upload to Vercel Blob
        console.log("Requesting upload URL for:", teamForm.file.name);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: JSON.stringify({ filename: teamForm.file.name }),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Blob upload error:", errorData);
          throw new Error(errorData.error || `HTTP error ${response.status}`);
        }

        const { url } = await response.json();
        console.log("Received upload URL:", url);
        if (!url) {
          throw new Error("No upload URL returned");
        }

        // Upload file directly
        console.log("Uploading file to:", url);
        const uploadResponse = await fetch(url, {
          method: "PUT",
          body: teamForm.file,
        });

        if (!uploadResponse.ok) {
          console.error("Upload failed:", await uploadResponse.text());
          throw new Error("Failed to upload file to Vercel Blob");
        }

        updateData.fileUrl = url;
      }

      await updateDoc(teamRef, updateData);

      setTeams(
        teams.map((team) =>
          team.id === teamForm.id ? { ...team, ...updateData } : team
        )
      );

      setShowModal(false);
      setIsEditing(false);
      setTeamForm({
        name: "",
        captain: "",
        viceCaptain: "",
        captainPhoneNumber: "",
        viceCaptainPhoneNumber: "",
        status: "active",
        email: "",
        players: [],
        file: null,
      });
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

      if (teamData.players && teamData.players.length > 0) {
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
        // Convert legacy Google Drive URLs to inline view URL
        if (
          teamData.fileUrl &&
          (teamData.fileUrl.includes("/file/d/") ||
            teamData.fileUrl.includes("uc?export=download") ||
            teamData.fileUrl.includes("drive.usercontent.google.com/download"))
        ) {
          const fileIdMatch = teamData.fileUrl.match(
            /\/d\/([^/]+)\/|id=([^&]+)/
          );
          const fileId = fileIdMatch ? fileIdMatch[1] || fileIdMatch[2] : null;
          if (fileId) {
            teamData.fileUrl = `https://drive.google.com/uc?id=${fileId}`;
            await updateDoc(teamRef, { fileUrl: teamData.fileUrl });
          }
        }
        // Legacy fileId support
        if (teamData.fileId && !teamData.fileUrl) {
          teamData.fileUrl = `https://drive.google.com/uc?id=${teamData.fileId}`;
          await updateDoc(teamRef, { fileUrl: teamData.fileUrl, fileId: null });
        }
        setViewTeamDetails(teamData);

        const players = teamData.players || [];
        const membersData = players.map((player, index) => ({
          id: index.toString(),
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
      alert("Error viewing team: " + error.message);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
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
                  style={{
                    width: "100%",
                    maxWidth: "200px",
                  }}
                >
                  Total Team: {teams.length}
                </Badge>
                <Button
                  variant="primary"
                  className="rounded-pill px-3 ms-2"
                  onClick={() => setShowModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>
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
                        {team.fileUrl ? (
                          <Image
                            src={team.fileUrl}
                            width={50}
                            height={50}
                            className="rounded-circle img-fluid"
                            alt={`${team.name}'s logo`}
                            onError={(e) => {
                              console.error(
                                "Error loading image:",
                                team.fileUrl
                              );
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                        ) : (
                          <span>No Logo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 fw-semibold">{team.name}</td>
                      <td className="px-4 py-3">
                        {team.captain}/{team.viceCaptain}
                      </td>
                      <td className="px-4 py-3">
                        {team.captainPhoneNumber}/{team.viceCaptainPhoneNumber}
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
            setTeamForm({
              name: "",
              captain: "",
              viceCaptain: "",
              captainPhoneNumber: "",
              viceCaptainPhoneNumber: "",
              status: "active",
              email: "",
              players: [],
              file: null,
            });
          }}
        >
          <Modal.Header>
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
                  value={teamForm.name}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, name: e.target.value })
                  }
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
                    label: `${captain.name}${
                      captain.phoneNumber ? ` (${captain.phoneNumber})` : ""
                    }`,
                    name: captain.name,
                    phoneNumber: captain.phoneNumber,
                    email: captain.email,
                    isDisabled: false,
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
                  options={availableCaptains.map((captain) => {
                    const isCaptain = teamForm.captain === captain.name;
                    return {
                      value: captain.id,
                      label: `${captain.name}${
                        captain.phoneNumber ? ` (${captain.phoneNumber})` : ""
                      }`,
                      name: captain.name,
                      phoneNumber: captain.phoneNumber,
                      email: captain.email,
                      isDisabled: isCaptain,
                    };
                  })}
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
                <Form.Label>Team Logo (Optional)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, file: e.target.files[0] })
                  }
                />
                <Form.Text className="text-muted">
                  Upload a team logo (JPEG, PNG, or GIF). Max 10 MB.
                </Form.Text>
              </Form.Group>

              <Form.Group className="formGroup mb-3">
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
                    viceCaptain: "",
                    captainPhoneNumber: "",
                    viceCaptainPhoneNumber: "",
                    status: "active",
                    email: "",
                    players: [],
                    file: null,
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
          className="wide-modal"
        >
          <Modal.Header>
            <Modal.Title>Team Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {viewTeamDetails && (
              <Container className="p-3">
                <h5 className="text-primary">
                  Team Name: {viewTeamDetails.name}
                </h5>
                {viewTeamDetails.fileUrl && (
                  <div className="mb-3">
                    <Image
                      src={viewTeamDetails.fileUrl}
                      width={200}
                      height={200}
                      alt="Team Logo"
                      className="img-fluid"
                      onError={(e) => {
                        console.error(
                          "Error loading image:",
                          viewTeamDetails.fileUrl
                        );
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <span style={{ display: "none" }}>No Logo</span>
                  </div>
                )}
                <hr />
                <h6 className="mb-3">Team Members</h6>
                {teamMembers.length > 0 ? (
                  <Table responsive="sm" striped variant="dark">
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
                          <td>{member.jerseyName}</td>
                          <td>{member.jerseyNumber}</td>
                          <td>{member.jerseySize.toUpperCase()}</td>
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
