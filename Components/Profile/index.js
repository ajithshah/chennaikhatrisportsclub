import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Container, Row, Col, Button } from "react-bootstrap";
import { auth } from "../../firebase";
import { usersDb, teamsDb } from "../../lib/db";
import Header from "../../Components/Header";
import Meta from "../../Components/Meta";
import { useSettings } from "../../lib/useSettings";
import styles from "./profile.module.css";

const Info = ({ icon, label, value, fallback = "Not provided" }) => (
  <div className={styles.info}>
    <span className={styles.infoIcon}>
      <i className={`fas ${icon}`}></i>
    </span>
    <div>
      <div className={styles.infoLabel}>{label}</div>
      <div className={styles.infoValue}>{value || fallback}</div>
    </div>
  </div>
);

export default function Profile() {
  const router = useRouter();
  const SHOW_TEAM_INFO = useSettings().settings.showTeamInfo;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState(null);
  const [animateEdit, setAnimateEdit] = useState(false);

  const fetchTeamData = async (userData) => {
    if (!userData?.phoneNumber) {
      console.error("No phone number found for user");
      return;
    }

    try {
      const userPhone = userData.phoneNumber;

      // First check if user is a team owner (captain or viceCaptain)
      const captainTeams = await teamsDb.findByCaptainPhone(userPhone);
      const viceCaptainTeams = await teamsDb.findByViceCaptainPhone(userPhone);

      let foundAsOwner = false;

      if (captainTeams.length > 0) {
        const team = captainTeams[0];
        foundAsOwner = true;
        setTeamData({
          id: team.id,
          ...team,
          role: "Captain",
          jerseyNumber:
            team.players?.find((p) => p.phoneNumber === userPhone)
              ?.jerseyNumber || "",
          jerseyName:
            team.players?.find((p) => p.phoneNumber === userPhone)
              ?.jerseyName || "",
          jerseySize:
            team.players?.find((p) => p.phoneNumber === userPhone)
              ?.jerseySize || "",
          isCaptain: true,
          isViceCaptain: false,
        });
      } else if (viceCaptainTeams.length > 0) {
        const team = viceCaptainTeams[0];
        foundAsOwner = true;
        setTeamData({
          id: team.id,
          ...team,
          role: "Vice Captain",
          jerseyNumber:
            team.players?.find((p) => p.phoneNumber === userPhone)
              ?.jerseyNumber || "",
          jerseyName:
            team.players?.find((p) => p.phoneNumber === userPhone)
              ?.jerseyName || "",
          jerseySize:
            team.players?.find((p) => p.phoneNumber === userPhone)
              ?.jerseySize || "",
          isCaptain: false,
          isViceCaptain: true,
        });
      }

      if (!foundAsOwner) {
        // Then check if user exists in any team's players array
        const result = await teamsDb.findByPlayerPhone(userPhone);

        if (result) {
          const { team, player } = result;
          setTeamData({
            id: team.id,
            name: team.name,
            role: "Player",
            jerseyNumber: player.jerseyNumber || "",
            jerseyName: player.jerseyName || "",
            jerseySize: player.jerseySize || "",
            isCaptain: player.isCaptain || false,
            isViceCaptain: player.isViceCaptain || false,
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
        const userDoc = await usersDb.get(user.uid);

        if (userDoc) {
          const userData = { ...userDoc, id: user.uid };
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

  const calculateAge = (dateOfBirth) => {
    try {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        return "Invalid date";
      }
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      return `${age} years`;
    } catch (error) {
      console.error("Error calculating age:", error);
      return "Error calculating age";
    }
  };

  return (
    <>
      <Meta
        title={userData ? `${userData.displayName} | Profile` : "Profile"}
      />
      <Header />
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <h2>Loading Your Profile</h2>
          <p>Please wait while we fetch your information...</p>
        </div>
      ) : (
        <div className={styles.page}>
          <section className={styles.hero}>
            <Container>
              <div className={styles.heroInner}>
                <div className={styles.avatar}>
                  {userData?.photoURL ? (
                    <Image
                      src={userData.photoURL}
                      alt="Profile"
                      width={140}
                      height={140}
                      className={styles.avatarImg}
                      priority
                    />
                  ) : (
                    <span>{userData?.displayName?.charAt(0) || "U"}</span>
                  )}
                </div>

                <div className={styles.identity}>
                  <h1 className={styles.name}>{userData?.displayName}</h1>
                  <div className={styles.badges}>
                    {teamData && SHOW_TEAM_INFO && (
                      <span className={styles.badge}>
                        <i className="fas fa-shield-alt"></i> {teamData.name}
                      </span>
                    )}
                    {teamData &&
                      (teamData.isCaptain || teamData.role === "Captain") && (
                        <span className={`${styles.badge} ${styles.badgeGold}`}>
                          <i className="fas fa-crown"></i> Team Captain
                        </span>
                      )}
                    {teamData &&
                      (teamData.isViceCaptain ||
                        teamData.role === "Vice Captain") && (
                        <span className={`${styles.badge} ${styles.badgeGold}`}>
                          <i className="fas fa-chess-knight"></i> Vice Captain
                        </span>
                      )}
                    {userData?.isAdmin && (
                      <span className={`${styles.badge} ${styles.badgeRed}`}>
                        <i className="fas fa-user-shield"></i> Administrator
                      </span>
                    )}
                  </div>
                  {userData?.email && (
                    <p className={styles.email}>{userData.email}</p>
                  )}
                </div>

                <div className={styles.heroActions}>
                  <Button
                    onClick={() => router.push("/profile/edit")}
                    className={`${styles.primaryBtn} ${
                      animateEdit ? "edit-button-glow" : ""
                    }`}
                  >
                    <i className="fas fa-edit"></i> Edit Profile
                  </Button>
                </div>
              </div>
            </Container>
          </section>

          <Container className={styles.content}>
            <Row className="g-4">
              <Col lg={6} className="mb-4">
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>
                    <i className="fas fa-id-card"></i> Contact
                  </h3>
                  <Info icon="fa-envelope" label="Email address" value={userData?.email} />
                  <Info icon="fa-phone-alt" label="Phone number" value={userData?.phoneNumber} />
                  <Info
                    icon="fa-map-marker-alt"
                    label="Address"
                    value={
                      userData?.address
                        ? [
                            userData.address.street,
                            [
                              userData.address.city,
                              userData.address.state,
                              userData.address.pincode,
                            ]
                              .filter(Boolean)
                              .join(", "),
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        : ""
                    }
                  />
                </div>
              </Col>

              <Col lg={6} className="mb-4">
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>
                    <i className="fas fa-user"></i> Personal
                  </h3>
                  <Info icon="fa-user" label="Full name" value={userData?.displayName} />
                  <Info
                    icon="fa-birthday-cake"
                    label="Date of birth"
                    value={
                      userData?.dateOfBirth
                        ? `${userData.dateOfBirth} (${calculateAge(
                            userData.dateOfBirth
                          )})`
                        : ""
                    }
                  />
                  <Info icon="fa-tint" label="Blood group" value={userData?.bloodGroup} />
                  <Info
                    icon="fa-clock"
                    label="Last login"
                    value={
                      userData?.lastLogin
                        ? new Date(userData.lastLogin).toLocaleString()
                        : ""
                    }
                    fallback="Not available"
                  />
                </div>
              </Col>
            </Row>

            <div className={styles.actions}>
              <Button variant="light" onClick={() => router.push("/")} className={styles.actionBtn}>
                <i className="fas fa-home"></i> Home
              </Button>

              {SHOW_TEAM_INFO && teamData && (
                <Button
                  variant="light"
                  onClick={() => router.push(`/team/${teamData.id}`)}
                  className={styles.actionBtn}
                >
                  <i className="fas fa-users"></i> View Team
                </Button>
              )}

              {teamData &&
                (userData.phoneNumber === teamData.captainPhoneNumber ||
                  userData.phoneNumber === teamData.viceCaptainPhoneNumber) && (
                  <Button
                    variant="light"
                    onClick={() => router.push(`/team/manage/${teamData.id}`)}
                    className={styles.actionBtn}
                  >
                    <i className="fas fa-user-cog"></i> Manage Team
                  </Button>
                )}

              {userData?.isAdmin && (
                <Button
                  variant="light"
                  onClick={() => router.push("/adminpanel")}
                  className={`${styles.actionBtn} ${styles.actionAdmin}`}
                >
                  <i className="fas fa-users-cog"></i> Admin Panel
                </Button>
              )}
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
