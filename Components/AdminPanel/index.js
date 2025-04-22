import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
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
      description: "Manage User",
      color: "#F44336",
      link: "/adminpanel/users",
    }
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto text-center">
        <h2 className="text-xl md:text-2xl font-semibold">
          Getting AdminPanel Details
        </h2>
        <p className="text-gray-500">
          Please wait while we load your admin panel details...
        </p>
      </div>
    );
  }

  return (
    <>
      <Meta />
      <Header />
      <Container className="py-5">
        <Row className="g-4">
          {sportsCategories.map((sport) => (
            <Col key={sport.id} xs={12} md={6} xl={4}>
              <Card
                className="border-0 shadow-sm hover-card h-100"
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                <div
                  className="py-3 px-4"
                  style={{
                    background: `${sport.color}15`,
                    borderBottom: `2px dashed ${sport.color}30`,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fs-1">{sport.icon}</span>
                    <Badge
                      bg="light"
                      text="dark"
                      className="rounded-pill px-3 py-2"
                    >
                      {sport.stats}
                    </Badge>
                  </div>
                </div>
                <Card.Body className="p-4">
                  <h3 className="fs-4 fw-bold mb-2">{sport.title}</h3>
                  <p className="text-muted mb-4">{sport.description}</p>
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      className="rounded-pill px-4 w-100"
                      onClick={() => router.push(sport.link)}
                    >
                      {/* <i className="fas fa-tasks me-2"></i> */}
                      Manage
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
