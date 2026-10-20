import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Row, Col, Modal } from "react-bootstrap";
import { auth } from "../../../firebase";
import { usersDb } from "../../../lib/db";
import { authFetch } from "../../../lib/authFetch";
import Meta from "@/Components/Meta";
import styles from "./userDetails.module.css";

export default function UserDetails({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const router = useRouter();

  // The server only answers this endpoint for super admins
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) return setIsSuperAdmin(false);
      try {
        const res = await authFetch("/api/super-admins");
        setIsSuperAdmin(res.ok);
      } catch {
        setIsSuperAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await usersDb.delete(user.id);
      router.push("/adminpanel/users");
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (!userId) {
          router.push("/adminpanel/users");
          return;
        }

        const userData = await usersDb.get(userId);

        if (userData) {
          setUser({ id: userId, ...userData });
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

  const Item = ({ icon, label, children }) => (
    <div className={styles.row}>
      <div className={styles.icon}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>
          {children || <span className={styles.muted}>Not provided</span>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.page}>
        <Meta title="User Details" />
        <div className={styles.state}>
          <div className={styles.spinner}></div>
          <h4>Loading user details...</h4>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <Meta title="User Details" />
        <div className={styles.state}>
          <h3>User not found</h3>
          <p className="text-muted">
            The requested user could not be found or you don&apos;t have permission to view this profile.
          </p>
          <button
            className={styles.back}
            onClick={() => router.push("/adminpanel/users")}
            aria-label="Back to users"
            title="Back to users"
            style={{ background: "#1b3a8a" }}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
      </div>
    );
  }

  const age = calculateAge(user.dateOfBirth);
  const addr = user.address;
  const addressLines = addr
    ? [addr.street, addr.city, [addr.state, addr.pincode].filter(Boolean).join(" - ")].filter(Boolean)
    : [];

  return (
    <div className={styles.page}>
      <Meta title={`${user.displayName || "User"} | User Details`} />

      <section className={styles.hero}>
        <Container>
          <div className={styles.topBar}>
            <button
              className={styles.back}
              onClick={() => router.push("/adminpanel/users")}
              aria-label="Back to users"
              title="Back to users"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            {isSuperAdmin && (
              <button
                className={styles.deleteBtn}
                onClick={() => {
                  setDeleteError("");
                  setConfirmDelete(true);
                }}
                aria-label="Delete user"
                title="Delete user"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            )}
          </div>
          <div className={styles.profile}>
            <div className={styles.avatar}>
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt={user.displayName || "User profile"} />
              ) : (
                user.displayName?.[0]?.toUpperCase() || "?"
              )}
            </div>
            <div>
              <h1 className={styles.name}>{user.displayName || "Unnamed user"}</h1>
              <div className={styles.chips}>
                <span className={`${styles.chip} ${user.isAdmin ? styles.chipAdmin : ""}`}>
                  {user.isAdmin ? "Administrator" : "Standard Member"}
                </span>
                {user.bloodGroup && <span className={styles.chip}>🩸 {user.bloodGroup}</span>}
                {age !== null && <span className={styles.chip}>{age} years old</span>}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className={styles.content}>
        <Row className="g-4">
          <Col md={6}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Contact</h2>
              <Item icon="fa-envelope" label="Email address">
                {user.email && <a href={`mailto:${user.email}`}>{user.email}</a>}
              </Item>
              <Item icon="fa-phone" label="Phone number">
                {user.phoneNumber && <a href={`tel:${user.phoneNumber}`}>{user.phoneNumber}</a>}
              </Item>
              <Item icon="fa-map-marker-alt" label="Address">
                {addressLines.length > 0 &&
                  addressLines.map((l, i) => <div key={i}>{l}</div>)}
              </Item>
            </div>
          </Col>
          <Col md={6}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Personal</h2>
              <Item icon="fa-birthday-cake" label="Date of birth">
                {user.dateOfBirth}
              </Item>
              <Item icon="fa-tint" label="Blood group">
                {user.bloodGroup}
              </Item>
              <Item icon="fa-calendar-check" label="Member since">
                {user.createdAt}
              </Item>
              <Item icon="fa-user-shield" label="Access level">
                {user.isAdmin ? "Administrator" : "Standard Member"}
              </Item>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal
        show={confirmDelete}
        onHide={() => !deleting && setConfirmDelete(false)}
        centered
      >
        <div className={styles.modalHead}>
          <h2>Delete user?</h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={() => setConfirmDelete(false)}
            disabled={deleting}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <Modal.Body>
          {deleteError && <div className={styles.error}>{deleteError}</div>}
          This will permanently delete <strong>{user.displayName || user.email}</strong>.
          This cannot be undone.
        </Modal.Body>
        <div className={styles.modalFoot}>
          <button
            className={styles.cancelBtn}
            onClick={() => setConfirmDelete(false)}
            disabled={deleting}
            aria-label="Cancel"
            title="Cancel"
          >
            <i className="fas fa-times"></i>
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Yes, delete"
            title="Yes, delete"
          >
            <i className={deleting ? "fas fa-spinner fa-spin" : "fas fa-trash-alt"}></i>
          </button>
        </div>
      </Modal>
    </div>
  );
}
