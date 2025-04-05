import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Container, Table, Button, Badge, Card, Form } from "react-bootstrap";
import { auth, db } from "../../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Header from "@/Components/Header";
import Meta from "@/Components/Meta";
import Modal from "react-bootstrap/Modal";

export default function ManageUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAndFetchUsers = async (currentUser) => {
      // Check if user is admin
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data().isAdmin) {
        router.push("/");
        return;
      }

      // Fetch all users
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersData);
      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAdminAndFetchUsers(user);
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
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0">Manage Users</h2>
              <Badge bg="primary text-light" className="px-3 py-2 rounded-pill">
                Total Users: {users.length}
              </Badge>
            </div>

            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Pofile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>DOB</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {user.photoURL && (
                          <Image
                            src={user.photoURL}
                            alt={user.displayName}
                            width={40}
                            height={40}
                            className="rounded-circle"
                          />
                        )}
                      </div>
                    </td>
                    <td>{user.displayName}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber || "-"}</td>
                    <td>{user.dateOfBirth || "-"}</td>
                    <td>
                      <Badge
                        bg={user.isAdmin ? "danger" : "success"}
                        className="text-light"
                      >
                        {user.isAdmin ? "Admin" : "User"}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="light"
                        className="rounded-pill"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
