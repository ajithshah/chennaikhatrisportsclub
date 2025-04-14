import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Card, Row, Col, Spinner } from "react-bootstrap";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function UserDetails({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (!userId) {
          router.push("/adminpanel/users");
          return;
        }

        const userDoc = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          setUser({ id: userSnapshot.id, ...userSnapshot.data() });
        } else {
          router.push("/adminpanel/users");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, router]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <>
      <Container className="py-5">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <h2 className="mb-4">User Details</h2>
            <div className="text-center mb-4">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || "User profile"}
                  width={180}
                  height={180}
                  className="rounded-circle border shadow-sm"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  className="d-flex justify-content-center align-items-center bg-light rounded-circle mx-auto"
                  style={{ width: 120, height: 120 }}
                >
                  <span className="h1 text-muted">
                    {user.displayName ? user.displayName[0].toUpperCase() : "?"}
                  </span>
                </div>
              )}
            </div>
            <Row className="g-4">
              <Col md={6}>
                <div className="mb-3">
                  <strong>Name:</strong>
                  <p>{user.displayName || "Not provided"}</p>
                </div>
                <div className="mb-3">
                  <strong>Email:</strong>
                  <p>{user.email || "Not provided"}</p>
                </div>
                <div className="mb-3">
                  <strong>Phone:</strong>
                  <p>{user.phoneNumber || "Not provided"}</p>
                </div>
                <div className="mb-3">
                  <strong>DOB:</strong>
                  <p>
                    {user.dateOfBirth ? (
                      <>
                        {user.dateOfBirth}{" "}
                        <span className="text-muted">
                          ({calculateAge(user.dateOfBirth)} years old)
                        </span>
                      </>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
                <div className="mb-3">
                  <strong>Address:</strong>
                  <p>
                    {user.address ? (
                      <>
                        {user.address.street && `${user.address.street}, `}
                        {user.address.city && `${user.address.city}, `}
                        {user.address.state && `${user.address.state}, `}
                        {user.address.pincode && user.address.pincode}
                      </>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <strong>Member Since:</strong>
                  <p>{user.createdAt}</p>
                </div>
                <div className="mb-3">
                  <strong>Role:</strong>
                  <p>{user.isAdmin ? "Admin" : "Member"}</p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
