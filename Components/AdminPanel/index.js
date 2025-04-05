import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Header from "../Header";
import Meta from "../Meta";

export default function AdminPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const sportsCategories = [
    {
      id: "cricket",
      title: "Manage Cricket Teams",
      icon: "🏏",
      description: "Manage cricket teams and players",
      color: "#4CAF50",
      link: "/adminpanel/cricket",
    },
    {
      id: "users",
      title: "Users",
      icon: "👥",
      description: "Manage club members and user permissions",
      color: "#F44336",
      link: "/adminpanel/users",
    },
  ];

  useEffect(() => {
    const checkAdmin = async (currentUser) => {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data().isAdmin) {
        router.push("/");
        return;
      }
      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAdmin(user);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Meta />
      <Header />
      <Container className="py-5">
        <h2 className="fw-bold mb-4">Admin Dashboard</h2>
        <Row className="g-4">
          {sportsCategories.map((sport) => (
            <Col key={sport.id} xs={12} md={6} lg={4}>
              <Card
                className="border-0 shadow-sm h-100 hover-card"
                style={{
                  borderLeft: `4px solid ${sport.color}`,
                  transition: "all 0.3s ease",
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="fs-2 me-3">{sport.icon}</span>
                    <h3 className="mb-0 fs-4 fw-bold">{sport.title}</h3>
                  </div>
                  <p className="text-muted mb-4">{sport.description}</p>
                  <Button
                    variant="outline-primary"
                    className="rounded-pill px-4"
                    onClick={() => router.push(sport.link)}
                  >
                    Manage {sport.title}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
