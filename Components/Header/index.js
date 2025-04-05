import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.png";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const Header = () => {
  const [user, setUser] = useState(null);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providerId: user.providerData[0].providerId,
          lastLogin: new Date().toISOString(),
        };

        await setDoc(userRef, userData, { merge: true });

        if (!userSnap.exists()) {
          userData.isAdmin = false;
          userData.createdAt = new Date().toISOString();
        }

        await setDoc(userRef, userData, { merge: true });
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Navbar
      bg="light"
      style={{ backgroundColor: "#FFF" }}
      variant="light"
      expand="lg"
      className="py-2 px-3 shadow"
    >
      <div className="container-fluid">
        <Navbar.Brand className="d-flex align-items-center">
          <Image
            src={logo}
            alt="Logo"
            width={50}
            height={50}
            className="me-2"
          />
          <div>
            <div className="fs-5 mb-0 text-dark font-weight-bold">
              <Link href="/" passHref legacyBehavior>
                <Nav.Link className="px-3 text-dark">
                  Chennai Khatri Sports Club
                </Nav.Link>
              </Link>
            </div>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse
          id="basic-navbar-nav"
          className="justify-content-between"
        >
          <Nav>
            <Link href="/" passHref legacyBehavior>
              <Nav.Link className="px-3 text-dark">Home</Nav.Link>
            </Link>
            {/* <Link href="/about" passHref legacyBehavior>
              <Nav.Link className="px-3 text-dark">About</Nav.Link>
            </Link> */}
            <Link href="/contact" passHref legacyBehavior>
              <Nav.Link className="px-3 text-dark">Contact</Nav.Link>
            </Link>
          </Nav>
          <Nav className="d-flex align-items-center justify-content-end gap-3 w-100">
            {user ? (
              <div className="d-flex align-items-center gap-3 bg-white rounded-pill px-4 py-2">
                <NavDropdown
                  align="end"
                  title={
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div className="d-flex align-items-center gap-2">
                        {user.photoURL && (
                          <Image
                            src={user.photoURL}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="rounded-circle border-2 border-primary shadow-sm"
                            style={{ borderStyle: "solid" }}
                            priority
                          />
                        )}
                        <span className="text-dark fw-semibold">
                          {user.displayName}
                        </span>
                      </div>
                      <i
                        className="fas fa-chevron-down text-muted"
                        style={{
                          fontSize: "12px",
                          transition: "transform 0.2s ease",
                        }}
                      ></i>
                    </div>
                  }
                  id="nav-dropdown"
                  className="profile-dropdown"
                >
                  <Link href="/profile" passHref legacyBehavior>
                    <NavDropdown.Item>View Profile</NavDropdown.Item>
                  </Link>
                  <NavDropdown.Divider />
                  <NavDropdown.Item
                    onClick={handleSignOut}
                    className="text-danger"
                  >
                    Sign Out
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-4 py-2 btn btn-primary rounded-pill"
                style={{
                  transition: "all 0.3s ease",
                  transform: "translateY(0)",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(13, 110, 253, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Sign Up with Google
              </button>
            )}
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default Header;
