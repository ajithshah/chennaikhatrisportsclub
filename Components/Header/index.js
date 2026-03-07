import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import logo from "../../public/logo.png";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { auth } from "../../firebase";
import { usersDb } from "../../lib/db";
import {
  signInWithGoogle,
  handleSignOut as signOutUser,
} from "../../utils/auth";

// Add custom styles for responsive behavior
const styles = {
  clubName: {
    "@media (max-width: 768px)": {
      display: "none",
    },
  },
};

const Header = () => {
  const [user, setUser] = useState(null);
  const [dbUserData, setDbUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        // Get the Firebase auth user
        setUser(authUser);

        // Fetch the user data from MongoDB
        const userData = await usersDb.get(authUser.uid);

        if (userData) {
          setDbUserData(userData);
        }
      } else {
        setUser(null);
        setDbUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = () => {
    signInWithGoogle(
      // Success callback
      (result) => {
        // Auth state listener will handle setting the user
        // We'll get the userData from Firestore in the useEffect
      },
      // Error callback
      (error) => {
        console.error("Error signing in:", error);
      }
    );
  };

  const handleSignOut = () => {
    signOutUser(
      // Success callback
      () => {
        setUser(null);
        setDbUserData(null);
      },
      // Error callback
      (error) => {
        console.error("Error signing out:", error);
      }
    );
  };

  // Check current path
  const currentPath = router.pathname;
  const isHomePage = currentPath === "/";
  const isAboutPage = currentPath === "/about";
  const isSchedultPage = currentPath === "/schedule";
  const isteamPage =
    currentPath === "/team" || currentPath.startsWith("/team/");
  const isContactPage = currentPath === "/contact";

  // Get display name from the database if available
  const displayName = dbUserData?.displayName || user?.displayName || "User";
  const photoURL = dbUserData?.photoURL || user?.photoURL;

  return (
    <Navbar
      bg="light"
      style={{ backgroundColor: "#FFF" }}
      variant="light"
      expand="lg"
      className="py-2 px-3 shadow fixed-top"
    >
      <div className="container-fluid">
        <Navbar.Brand className="d-flex align-items-center">
          <Link href="/" passHref legacyBehavior>
            <Nav.Link>
              <Image
                src={logo}
                alt="Logo"
                width={50}
                height={50}
                className="me-2"
              />
            </Nav.Link>
          </Link>
          <div>
            <div className="fs-5 mb-0 text-dark font-weight-bold">
              <Link href="/" passHref legacyBehavior>
                <Nav.Link className="px-3 text-dark club-name">
                  <span className="d-none d-md-inline">
                    Chennai Khatri Sports Club
                  </span>
                  <span className="d-inline d-md-none">CKSC</span>
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
            {/* Home link - always show but highlight when active */}
            <Link href="/" passHref legacyBehavior>
              <Nav.Link
                className={`px-3 ${
                  isHomePage ? "fw-bold text-primary active" : "text-dark"
                }`}
                style={isHomePage ? { borderBottom: "2px solid #0d6efd" } : {}}
              >
                Home
              </Nav.Link>
            </Link>

            {/* About link */}
            <Link href="/about" passHref legacyBehavior>
              <Nav.Link
                className={`px-3 ${
                  isAboutPage ? "fw-bold text-primary active" : "text-dark"
                }`}
                style={isAboutPage ? { borderBottom: "2px solid #0d6efd" } : {}}
              >
                About
              </Nav.Link>
            </Link>

            {/* Schedule Link */}
            <Link href="/auction" passHref legacyBehavior>
              <Nav.Link
                className={`px-3 ${
                  isSchedultPage ? "fw-bold text-primary active" : "text-dark"
                }`}
                style={
                  isSchedultPage
                    ? {
                        borderBottom: "2px solid #0d6efd",
                      }
                    : {}
                }
              >
                Auction
              </Nav.Link>
            </Link>

            {/* Contact Link */}
            <Link href="/contact" passHref legacyBehavior>
              <Nav.Link
                className={`px-3 ${
                  isContactPage ? "fw-bold text-primary active" : "text-dark"
                }`}
                style={isContactPage ? { borderBottom: "2px solid #0d6efd" } : {}}
              >
                Contact
              </Nav.Link>
            </Link>

            {/* Team Link */}
            {/* <Link href="/team" passHref legacyBehavior>
              <Nav.Link
                className={`px-3 ${
                  isteamPage ? "fw-bold text-primary active" : "text-dark"
                }`}
                style={isteamPage ? { borderBottom: "2px solid #0d6efd" } : {}}
              >
                KPL&nbsp;Season&nbsp;3
              </Nav.Link>
            </Link> */}
          </Nav>
          <Nav className="d-flex align-items-center justify-content-end gap-3 w-100">
            {user ? (
              <div className="d-flex align-items-center gap-3 bg-white rounded-pill px-4 py-2">
                <NavDropdown
                  align="end"
                  title={
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div className="d-flex align-items-center gap-2">
                        {photoURL && (
                          <Image
                            src={photoURL}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="rounded-circle border-2 border-primary shadow-sm"
                            style={{ borderStyle: "solid" }}
                            priority
                          />
                        )}
                        <span className="text-dark fw-semibold ml-2">
                          {displayName}
                        </span>
                      </div>
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
                onClick={handleGoogleSignIn}
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
                Sign In with Google
              </button>
            )}
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default Header;
