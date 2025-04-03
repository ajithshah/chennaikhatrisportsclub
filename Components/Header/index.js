import React from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.png";
import { Navbar, Nav } from "react-bootstrap";

const Header = () => {
  return (
    <>
      <Navbar
        // bg="light"
        style={{ backgroundColor: "#adadad" }}
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
              <div className="fs-5 mb-0 fw-bold text-dark">
                Khatri Premier League
              </div>
              <div className="text-dark small">Season - 3</div>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Link href="/" passHref legacyBehavior>
                <Nav.Link className="px-3 text-dark">Home</Nav.Link>
              </Link>
              <Link href="/about" passHref legacyBehavior>
                <Nav.Link className="px-3 text-dark">About</Nav.Link>
              </Link>
              <Link href="/contact" passHref legacyBehavior>
                <Nav.Link className="px-3 text-dark">Contact</Nav.Link>
              </Link>
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
      {/* <marquee behavior="scroll" direction="left" scrollamount="10">
        🏏 Here is some scrolling text... right to left! 🏏
      </marquee> */}
    </>
  );
};

export default Header;
