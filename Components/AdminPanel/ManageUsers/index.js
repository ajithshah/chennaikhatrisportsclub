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
  const [usersPerPage] = useState(20);
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

    // For mobile screens, show fewer page numbers
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const maxVisiblePages = isMobile ? 3 : 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add ellipsis for first page if needed
    if (startPage > 1) {
      pageNumbers.push(
        <Pagination.Item
          key={1}
          onClick={() => paginate(1)}
          className="pagination-item d-none d-sm-block"
        >
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <Pagination.Ellipsis
            key="ellipsis1"
            className="d-none d-sm-block"
            disabled
          />
        );
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => paginate(i)}
          className="pagination-item"
        >
          {i}
        </Pagination.Item>
      );
    }

    // Add ellipsis for last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <Pagination.Ellipsis
            key="ellipsis2"
            className="d-none d-sm-block"
            disabled
          />
        );
      }
      pageNumbers.push(
        <Pagination.Item
          key={totalPages}
          onClick={() => paginate(totalPages)}
          className="pagination-item d-none d-sm-block"
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return totalPages > 1 ? (
      <div className="d-flex justify-content-center mt-4 pagination-container">
        <Pagination className="flex-wrap">
          <Pagination.First
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className="pagination-control d-none d-sm-block"
          />
          <Pagination.Prev
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-control"
          />
          {pageNumbers}
          <Pagination.Next
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-control"
          />
          <Pagination.Last
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-control d-none d-sm-block"
          />
        </Pagination>
      </div>
    ) : null;
  };

  if (loading) {
    return (
      <>
        <Meta />
        <Header />
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="loading-animation">
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
            <h2 className="loading-text">Getting User Details</h2>
            <p className="loading-subtext">
              Please wait while we load your user details...
            </p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Meta />
      <style jsx global>{`
        /* Card animation */
        .admin-card {
          transform: translateY(20px);
          opacity: 0;
          animation: slideUpFade 0.6s ease forwards;
        }

        @keyframes slideUpFade {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Title animation */
        .title-animation {
          opacity: 0;
          transform: translateY(-10px);
          animation: fadeDown 0.5s ease 0.2s forwards;
        }

        @keyframes fadeDown {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Search input animation */
        .search-animation {
          opacity: 0;
          transform: translateX(-20px);
          animation: slideRight 0.5s ease 0.3s forwards;
        }

        @keyframes slideRight {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Badge animation */
        .badge-animation {
          opacity: 0;
          transform: scale(0.8);
          animation: popIn 0.5s ease 0.4s forwards;
        }

        @keyframes popIn {
          70% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Table header animation */
        .table-header {
          opacity: 0;
          animation: fadeIn 0.5s ease 0.5s forwards;
        }

        /* Table row animation */
        .table-row {
          opacity: 0;
          transform: translateX(-10px);
          animation: tableRowIn 0.4s ease forwards;
        }

        .table-row:nth-child(1) {
          animation-delay: 0.5s;
        }
        .table-row:nth-child(2) {
          animation-delay: 0.55s;
        }
        .table-row:nth-child(3) {
          animation-delay: 0.6s;
        }
        .table-row:nth-child(4) {
          animation-delay: 0.65s;
        }
        .table-row:nth-child(5) {
          animation-delay: 0.7s;
        }
        .table-row:nth-child(6) {
          animation-delay: 0.75s;
        }
        .table-row:nth-child(7) {
          animation-delay: 0.8s;
        }
        .table-row:nth-child(8) {
          animation-delay: 0.85s;
        }
        .table-row:nth-child(9) {
          animation-delay: 0.9s;
        }
        .table-row:nth-child(10) {
          animation-delay: 0.95s;
        }

        @keyframes tableRowIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Button hover animation */
        .view-btn {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .view-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .view-btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(-100%);
        }

        .view-btn:hover::after {
          transform: translateX(100%);
          transition: transform 0.4s ease;
        }

        /* Empty state animation */
        .empty-state {
          opacity: 0;
          transform: translateY(10px);
          animation: fadeUp 0.5s ease 0.5s forwards;
        }

        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Pagination animation */
        .pagination-container {
          opacity: 0;
          animation: fadeIn 0.5s ease 1s forwards;
        }

        .pagination-item,
        .pagination-control {
          transition: all 0.3s ease;
        }

        .pagination-item:hover,
        .pagination-control:hover {
          transform: translateY(-2px);
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        /* Loading animation */
        .loading-animation {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .spinner-container {
          margin-bottom: 2rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(13, 110, 253, 0.1);
          border-radius: 50%;
          border-top-color: #0d6efd;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-text {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          opacity: 0;
          animation: pulseOpacity 1.5s ease-in-out 0.3s infinite alternate;
        }

        .loading-subtext {
          color: #6c757d;
          opacity: 0;
          animation: pulseOpacity 1.5s ease-in-out 0.4s infinite alternate;
        }

        @keyframes pulseOpacity {
          from {
            opacity: 0.6;
          }
          to {
            opacity: 1;
          }
        }

        /* Enhanced hover effects for the table */
        .table-hover tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        /* Badge animation on hover */
        .role-badge {
          transition: all 0.3s ease;
        }

        .role-badge:hover {
          transform: scale(1.1);
        }

        /* Profile image animation */
        .profile-image {
          transition: all 0.3s ease;
        }

        .profile-image:hover {
          transform: scale(1.1);
          box-shadow: 0 0 12px rgba(13, 110, 253, 0.3);
        }

        /* Pagination responsive styles */
        @media (max-width: 767px) {
          .pagination {
            gap: 5px;
          }
          
          .pagination .page-item .page-link {
            padding: 0.4rem 0.7rem;
            font-size: 0.9rem;
          }
          
          .pagination-container {
            overflow-x: auto;
            padding-bottom: 15px;
            justify-content: center;
          }
          
          .pagination-control .page-link {
            padding: 0.4rem 0.6rem;
            font-size: 0.85rem;
          }
        }
        
        /* Enhanced pagination styling */
        .pagination .page-item.active .page-link {
          background-color: #0d6efd;
          border-color: #0d6efd;
          transform: scale(1.1);
          box-shadow: 0 2px 5px rgba(13, 110, 253, 0.3);
          z-index: 3;
        }
        
        .pagination .page-link {
          border-radius: 5px;
          margin: 0 2px;
          transition: all 0.3s ease;
        }
        
        .pagination .page-link:hover {
          background-color: #e9ecef;
          transform: translateY(-2px;
        }
      `}</style>
      <Header />
      <Container className="py-5">
        <Card className="border-0 shadow-sm admin-card">
          <Card.Body className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-4 mb-4">
              <h2 className="fw-bold mb-md-0 text-nowrap text-center title-animation">
                Manage Users
              </h2>
              <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center w-100 w-md-auto justify-content-center gap-4 gap-md-5">
                <input
                  type="search"
                  placeholder="Search users..."
                  className="form-control mb-3 mb-md-0 search-animation"
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
                  className="px-4 py-3 rounded-pill text-light text-center ml-2 badge-animation"
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
                  <tr className="table-header">
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>DOB</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, index) => (
                    <tr key={user.id} className="table-row">
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {user.photoURL && (
                            <div className="profile-container">
                              <Image
                                src={user.photoURL}
                                alt={user.displayName}
                                width={40}
                                height={40}
                                className="rounded-circle profile-image"
                                style={{
                                  width: "clamp(30px, 4vw, 40px)",
                                  height: "clamp(30px, 4vw, 40px)",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          )}
                          {!user.photoURL && (
                            <div className="profile-container">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center profile-image"
                                style={{
                                  width: "clamp(30px, 4vw, 40px)",
                                  height: "clamp(30px, 4vw, 40px)",
                                  backgroundColor: "#e9ecef",
                                  color: "#495057",
                                  fontSize: "clamp(12px, 1.5vw, 16px)",
                                }}
                              >
                                {user.displayName?.charAt(0).toUpperCase() ||
                                  "U"}
                              </div>
                            </div>
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
                          className="text-light role-badge"
                        >
                          {user.isAdmin ? "Admin" : "User"}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="rounded-pill view-btn"
                          onClick={() =>
                            router.push(`/adminpanel/users/${user.id}`)
                          }
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-5 empty-state">
                <div className="mb-3">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.5 9C15.5 10.933 13.933 12.5 12 12.5C10.067 12.5 8.5 10.933 8.5 9C8.5 7.067 10.067 5.5 12 5.5C13.933 5.5 15.5 7.067 15.5 9Z"
                      stroke="#6c757d"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 15.5C8.13401 15.5 5 18.634 5 22.5H19C19 18.634 15.866 15.5 12 15.5Z"
                      stroke="#6c757d"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 15L5 15"
                      stroke="#6c757d"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h5 className="text-secondary">No users found</h5>
                <p className="text-muted">
                  No users match your search criteria. Try adjusting your search
                  term.
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
