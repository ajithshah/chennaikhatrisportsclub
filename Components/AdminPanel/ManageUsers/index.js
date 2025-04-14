import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  Container,
  Table,
  Button,
  Badge,
  Card,
  Pagination,
} from "react-bootstrap";
import { auth, db } from "../../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Header from "@/Components/Header";
import Meta from "@/Components/Meta";

export default function ManageUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm)
  );

  // Get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const PaginationComponent = () => {
    const pageNumbers = [];
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => paginate(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return totalPages > 1 ? (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.First
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {pageNumbers}
          <Pagination.Next
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    ) : null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto text-center">
        <h2 className="text-xl md:text-2xl font-semibold">
          Getting User Details
        </h2>
        <p className="text-gray-500">
          Please wait while we load your user details...
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
            <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-4 mb-2">
              <h2 className="fw-bold mb-md-0 text-nowrap text-center">
                Manage Users
              </h2>
              <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center w-100 w-md-auto justify-content-center gap-4 gap-md-5">
                <input
                  type="search"
                  placeholder="Search users..."
                  className="form-control mb-3 mb-md-0"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                  }}
                />
                <Badge
                  bg="primary"
                  className="px-4 py-3 rounded-pill text-light text-center"
                  style={{
                    width: "100%",
                    maxWidth: "200px",
                  }}
                >
                  Total Users: {filteredUsers.length}
                </Badge>
              </div>
            </div>

            {filteredUsers.length > 0 ? (
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>DOB</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
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
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">
                  No users found matching your search.
                </p>
              </div>
            )}
            <PaginationComponent />
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
