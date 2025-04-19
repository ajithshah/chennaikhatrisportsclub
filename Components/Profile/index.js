import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Container, Card, Row, Col, Button, Badge } from "react-bootstrap";
import { auth, db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import Header from "../../Components/Header";
import Meta from "../../Components/Meta";

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState(null);

  const fetchTeamData = async (userData) => {
    if (!userData?.phoneNumber) {
      console.error("No phone number found for user");
      return;
    }

    try {
      const teamsRef = collection(db, "cricket_teams");
      const userPhone = userData.phoneNumber;

      // First check if user is a team owner (captain or viceCaptain)
      const teamQuery = query(
        teamsRef,
        where("captainPhoneNumber", "==", userPhone)
      );
      const teamSnapshot = await getDocs(teamQuery);

      // Check if user is vice captain
      const viceCaptainQuery = query(
        teamsRef,
        where("viceCaptainPhoneNumber", "==", userPhone)
      );
      const viceCaptainSnapshot = await getDocs(viceCaptainQuery);

      let foundAsOwner = false;

      if (!teamSnapshot.empty) {
        const teamDoc = teamSnapshot.docs[0];
        const teamData = teamDoc.data();
        foundAsOwner = true;
        setTeamData({
          id: teamDoc.id,
          ...teamData,
          role: "Captain",
          jerseyNumber:
            teamData.players?.find((p) => p.phoneNumber === userPhone)?.jerseyNumber || "",
          jerseyName:
            teamData.players?.find((p) => p.phoneNumber === userPhone)?.jerseyName || "",
          jerseySize:
            teamData.players?.find((p) => p.phoneNumber === userPhone)?.jerseySize || "",
          isCaptain: true,
          isViceCaptain: false,
        });
      } else if (!viceCaptainSnapshot.empty) {
        const teamDoc = viceCaptainSnapshot.docs[0];
        const teamData = teamDoc.data();
        foundAsOwner = true;
        setTeamData({
          id: teamDoc.id,
          ...teamData,
          role: "Vice Captain",
          jerseyNumber:
            teamData.players?.find((p) => p.phoneNumber === userPhone)?.jerseyNumber || "",
          jerseyName:
            teamData.players?.find((p) => p.phoneNumber === userPhone)?.jerseyName || "",
          jerseySize:
            teamData.players?.find((p) => p.phoneNumber === userPhone)?.jerseySize || "",
          isCaptain: false,
          isViceCaptain: true,
        });
      }

      if (!foundAsOwner) {
        // Then check if user exists in any team's players array
        const teamsSnapshot = await getDocs(teamsRef);
        let playerTeam = null;

        // Search through all teams for matching player
        for (const doc of teamsSnapshot.docs) {
          const team = doc.data();
          const playerMatch = team.players?.find((player) => player.phoneNumber === userPhone);
          if (playerMatch) {
            playerTeam = { id: doc.id, ...team, playerDetails: playerMatch };
            break;
          }
        }

        if (playerTeam) {
          setTeamData({
            id: playerTeam.id,
            name: playerTeam.name,
            role: "Player",
            jerseyNumber: playerTeam.playerDetails.jerseyNumber || "",
            jerseyName: playerTeam.playerDetails.jerseyName || "",
            jerseySize: playerTeam.playerDetails.jerseySize || "",
            isCaptain: playerTeam.playerDetails.isCaptain || false,
            isViceCaptain: playerTeam.playerDetails.isViceCaptain || false,
          });
        } else {
          console.log("User not found in any team");
          setTeamData(null);
        }
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      setTeamData(null);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = { ...userSnap.data(), id: user.uid };
          setUserData(userData);
          await fetchTeamData(userData); // Pass the full userData object
        }
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto text-center">
        <h2 className="text-xl md:text-2xl font-semibold">Getting Profile Details</h2>
        <p className="text-gray-500">Please wait while we load your profile details</p>
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
            <Row>
              <Col md={4} className="text-center mb-4 mb-md-0">
                {userData?.photoURL && (
                  <div className="position-relative d-inline-block">
                    <Image
                      src={userData.photoURL}
                      alt="Profile"
                      width={150}
                      height={150}
                      className="rounded-circle border-4 border-primary"
                      style={{ borderStyle: "solid" }}
                      priority
                    />
                  </div>
                )}
              </Col>
              <Col md={8}>
                <h2 className="mb-4 fw-bold">{userData?.displayName}</h2>
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>Name:</div>
                    <div>{userData?.displayName || "Not provided"}</div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>Email:</div>
                    <div>{userData?.email || "Not provided"}</div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>Mobile:</div>
                    <div>{userData?.phoneNumber || "Not provided"}</div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>Date Of Birth:</div>
                    <div>{userData?.dateOfBirth || "Not provided"}</div>
                  </div>
                  
                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>Address:</div>
                    <div>
                      {userData?.address ? (
                        <>
                          {userData.address.street && <div>{userData.address.street}</div>}
                          <div>
                            {[
                              userData.address.city,
                              userData.address.state,
                              userData.address.pincode,
                            ]
                              .filter(Boolean)
                              .join(", ") || "Not provided"}
                          </div>
                        </>
                      ) : (
                        "Not provided"
                      )}
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>Last Login:</div>
                    <div>
                      {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString() : "Not provided"}
                    </div>
                  </div>
                </div>

                {teamData && (
                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>Cricket Team:</div>
                    <div className="d-flex align-items-center gap-2">
                      Associated with
                      <Badge bg="primary" text="light" className="rounded-pill px-3 py-2 ml-1">
                        {teamData.name}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="d-flex gap-3 mt-4">
                  <Button variant="primary" onClick={() => router.push("/")} className="px-4 py-2 rounded-pill">
                    <i className="fas fa-home mr-2"></i>
                    Home
                  </Button>
                  <Button variant="primary" onClick={() => router.push("/profile/edit")} className="px-2 py-2 rounded-pill ms-2 ml-2">
                    <i className="fas fa-edit mr-2"></i>
                    Edit Profile
                  </Button>
                  {teamData && (
                    <Button variant="outline-success" onClick={() => router.push(`/team/${teamData.id}`)} className="px-2 py-2 rounded-pill ms-2 ml-2">
                      <i className="fas fa-users mr-2"></i>
                      View {teamData.name}
                    </Button>
                  )}
                  {teamData && ( teamData.captainPhoneNumber || teamData.viceCaptainPhoneNumber === userData.phoneNumber ) && (
                    <Button variant="outline-success" onClick={() => router.push(`/team/manage/${teamData.id}`)} className="px-2 py-2 rounded-pill ms-2 ml-2">
                      <i className="fas fa-users mr-2"></i>
                      Manage Team
                    </Button>
                  )}
                  {userData?.isAdmin && (
                    <Button variant="outline-primary" onClick={() => router.push("/adminpanel")} className="px-2 py-2 rounded-pill ms-2 ml-2">
                      <i className="fas fa-users-cog mr-2"></i>
                      Admin Panel
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}