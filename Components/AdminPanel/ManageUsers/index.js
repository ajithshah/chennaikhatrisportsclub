import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { auth } from "../../../firebase";
import { usersDb } from "../../../lib/db";
import Header from "@/Components/Header";
import Meta from "@/Components/Meta";
import styles from "./manageUsers.module.css";

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
      const userData = await usersDb.get(currentUser.uid);

      if (!userData || !userData.isAdmin) {
        router.push("/");
        return;
      }

      // Fetch all users
      const usersData = await usersDb.getAll();
      // Transform to include id field
      const usersWithId = usersData.map((user) => ({
        ...user,
        id: user._id || user.uid,
      }));

      setUsers(usersWithId);
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

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  const adminCount = users.filter((u) => u.isAdmin).length;

  const pageNumbers = [];
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  for (let i = start; i <= Math.min(totalPages, start + 4); i++) pageNumbers.push(i);

  if (loading) {
    return (
      <div className={styles.page}>
        <Meta />
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <h2>Getting User Details</h2>
          <p className="text-muted">Please wait while we load your user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Meta />
      <Header />

      <section className={styles.hero}>
        <Container>
          <button
            className={styles.back}
            onClick={() => router.push("/adminpanel")}
            aria-label="Back to admin panel"
            title="Back to admin panel"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className={styles.title}>
            👥 Manage <span>Users</span>
          </h1>
          <p className={styles.subtitle}>View and manage everyone registered on the site</p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong>{users.length}</strong>
              <span>Total users</span>
            </div>
            <div className={styles.stat}>
              <strong>{adminCount}</strong>
              <span>Admins</span>
            </div>
          </div>
        </Container>
      </section>

      <Container className={styles.content}>
        <div className={styles.toolbar}>
          <input
            type="search"
            placeholder="Search by name, email or phone..."
            className={styles.search}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <span className={styles.count}>
            {filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className={styles.empty}>
            <h5>No users found</h5>
            <p className="mb-0">No users match your search. Try a different term.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {currentUsers.map((user) => (
              <div
                key={user.id}
                className={`${styles.card} ${user.isAdmin ? styles.cardAdmin : ""}`}
              >
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>
                    {user.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.photoURL} alt={user.displayName || "User"} />
                    ) : (
                      user.displayName?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div className={styles.who}>
                    <h3>{user.displayName || "Unnamed user"}</h3>
                    <span className={`${styles.badge} ${user.isAdmin ? styles.badgeAdmin : ""}`}>
                      {user.isAdmin ? "Admin" : "User"}
                    </span>
                  </div>
                </div>

                <div className={styles.info}>
                  <div>
                    <i className="fas fa-envelope"></i>
                    <span title={user.email}>{user.email || "-"}</span>
                  </div>
                  <div>
                    <i className="fas fa-phone"></i>
                    <span>{user.phoneNumber || "-"}</span>
                  </div>
                  <div>
                    <i className="fas fa-birthday-cake"></i>
                    <span>{user.dateOfBirth || "-"}</span>
                  </div>
                </div>

                <div className={styles.cardBottom}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => router.push(`/adminpanel/users/${user.id}`)}
                    aria-label={`View ${user.displayName || "user"}`}
                    title="View details"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pager}>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                className={`${styles.pageBtn} ${n === currentPage ? styles.pageActive : ""}`}
                onClick={() => setCurrentPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </Container>
    </div>
  );
}
