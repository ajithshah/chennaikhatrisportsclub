import React from "react";
import Link from "next/link";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="footer position-relative">
      <Container>
      <Row className="mt-3">
          <Col className="text-center">
            <p className="copyright mb-1">
              © {new Date().getFullYear()} Chennai Khatri Sports Club. All rights reserved.
            </p>
            {<p className="developer-credit">
             Developed by <span className="developer-name">Shanthosh sha , Ajith sha</span>
             </p>}
          </Col>
        </Row>
        <Row className="align-items-center justify-content-between flex-wrap">
        
          {/* Left side */}
          <Col xs="auto" className="d-flex flex-column align-items-start">
            <p className="follow-us mb-2">Follow Us</p>
            <div className="social-links d-flex gap-3 social-container">
              <a
                href="https://www.instagram.com/chennai_khatri_sports.club?igsh=azVtaWhnMDRmNnpz"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon bg-light"
              >
                <i className="fab fa-instagram fs-4 text-danger"></i>
              </a>
              <a
                href="https://www.youtube.com/@KhatriSportsClub"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon bg-light"
              >
                <i className="fab fa-youtube fs-4 text-danger"></i>
              </a>
            </div>
          </Col>

          {/* Right side */}
          <Col xs="auto" className="d-flex flex-column align-items-end text-end">
            <p className="contact-us mb-1">Contact Us</p>
            <a
              className="contact-link text-decoration-none"
            >
              Vinod Kumar +91 98408 80873
            </a>
            <a
              className="contact-link text-decoration-none"
            >  
              Sushil +91-98417 12284
            </a>
            <a
              className="contact-link text-decoration-none"
            >
              Rajini +91-98415 26709
            </a>
          </Col>
        </Row>

        {/* Bottom row */}

      </Container>

      <style jsx>{`
        .footer {
          background: linear-gradient(to right, #0a2540, #0d6efd);
          color: white;
          padding-top: 2rem;
          padding-bottom: 1rem;
        }

        .follow-us {
          font-size: 1rem;
          font-weight: 600;
          margin-left: 10px;
        }

        .social-container {
          margin-left: 10px;
        }

        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s ease;
        }

        .social-icon:hover {
          background-color: white;
          color: #0d6efd;
          transform: translateY(-3px);
        }

        .contact-us {
          font-size: 1rem;
          font-weight: 600;
        }

        .contact-link {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .contact-link:hover {
          color: white;
        }

        .copyright {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 0;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
