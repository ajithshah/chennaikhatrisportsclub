import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Header from "../../Components/Header";
import Meta from "../../Components/Meta";

export function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData({ ...userSnap.data(), id: user.uid });
        }

        console.log(userSnap.data());
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
        <h2 className="text-xl md:text-2xl font-semibold">
          Getting Profile Details
        </h2>
        <p className="text-gray-500">
          Please wait while we load your profile details
        </p>
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
                    <div className="text-muted" style={{ width: "140px" }}>
                      <i className="fas fa-map-marker-alt me-2"></i>Name:
                    </div>
                    <div>{userData?.displayName || "Not provided"}</div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>
                      <i className="fas fa-envelope me-2"></i>Email:
                    </div>
                    <div>{userData?.email || "Not provided"}</div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>
                      <i className="fas fa-phone me-2"></i>Mobile:
                    </div>
                    <div>{userData?.phoneNumber || "Not provided"}</div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>
                      <i className="fas fa-phone me-2"></i>Date Of Birth:
                    </div>
                    <div>{userData?.dateOfBirth || "Not provided"}</div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>
                      <i className="fas fa-clock me-2"></i>Last Login:
                    </div>
                    <div>
                      {userData?.lastLogin
                        ? new Date(userData.lastLogin).toLocaleString()
                        : "Not provided"}
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3 mt-4">
                  <Button
                    variant="primary"
                    onClick={() => router.push("/")}
                    className="px-4 py-2 rounded-pill"
                  >
                    <i className="fas fa-edit me-2"></i>
                    Home
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => router.push("/profile/edit")}
                    className="px-2 py-2 rounded-pill ms-2 ml-2"
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit Profile
                  </Button>

                  {userData?.isAdmin && (
                    <Button
                      variant="outline-primary"
                      onClick={() => router.push("/adminpanel")}
                      className="px-2 py-2 rounded-pill ms-2 ml-2"
                    >
                      <i className="fas fa-users-cog me-2"></i>
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

export default Profile;
