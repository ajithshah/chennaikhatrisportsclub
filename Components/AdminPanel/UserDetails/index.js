import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Meta from "@/Components/Meta";

export default function UserDetails({ userId }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      try {
        // Check if admin is authenticated
        const currentUser = auth.currentUser;
        if (!currentUser) {
          router.push("/login");
          return;
        }

        // Check if current user is admin
        const adminRef = doc(db, "users", currentUser.uid);
        const adminSnap = await getDoc(adminRef);
        const adminData = adminSnap.data();

        if (!adminSnap.exists() || !adminData.isAdmin) {
          router.push("/");
          return;
        }

        // Fetch target user details
        if (userId) {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUser({
              id: userSnap.id,
              displayName: userData.displayName,
              email: userData.email,
              dateOfBirth: userData.dateOfBirth,
              createdAt: userData.createdAt,
              isAdmin: userData.isAdmin,
              photoURL: userData.photoURL,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      setLoading(false);
    };

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAuthAndFetchUser();
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [userId, router]);

  // ...existing loading and error states remain the same...

  return (
    <>
      <Meta title={`User Details - ${user?.displayName || "User"}`} />
      <Container className="py-5">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">{/* ...existing JSX code... */}</Card.Body>
        </Card>
      </Container>
    </>
  );
}
