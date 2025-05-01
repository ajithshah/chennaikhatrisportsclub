import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="footer position-relative container-fluid">
      <Container className="footer-container">
        <Row className="justify-content-between align-items-center">
          {/* Left */}
          <Col
            xs={12}
            sm={6}
            md={4}
            lg="auto"
            className="d-flex flex-column align-items-center align-items-sm-start mb-3 mb-sm-0"
          >
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
                className="social-icon bg-light ml-2"
              >
                <i className="fab fa-youtube fs-4 text-danger"></i>
              </a>
            </div>
          </Col>

          {/* Center */}
          <Col
            xs={12}
            sm={12}
            md={4}
            className="text-center mb-3 mb-md-0 order-3 order-md-2"
          >
            <p className="copyright mb-1">
              © 2025 Chennai Khatri Sports Club. All
              rights reserved.
            </p>
            {
              <p className="developer-credit text-light">
                Developed by{" "}
                <span className="developer-name">
                  Shanthosh sha , Ajith sha
                </span>
              </p>
            }
          </Col>

          {/* Right side */}
          <Col
            xs={12}
            sm={6}
            md={4}
            lg="auto"
            className="d-flex flex-column align-items-center align-items-sm-end text-center text-sm-end order-2 order-md-3"
          >
            <p className="contact-us mb-1">Contact Us</p>
            <a className="contact-link text-decoration-none">
              Vinod Kumar +91 98408 80873
            </a>
            <a className="contact-link text-decoration-none">
              Sushil +91-98417 12284
            </a>
            <a className="contact-link text-decoration-none">
              Rajini +91-98415 26709
            </a>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .footer {
          background: linear-gradient(to right, #0a2540, #0d6efd);
          color: white;
          padding-top: 2rem;
          padding-bottom: 1rem;
        }

        .footer-container {
          max-width: 1000px; /* Reduced width from the default Bootstrap container */
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
          font-size: 0.9rem;
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

        .developer-credit {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .developer-name {
          font-weight: 600;
        }

        @media (max-width: 767px) {
          .contact-link {
            margin-bottom: 0.25rem;
          }

          .footer {
            padding-bottom: 1.5rem;
          }
        }

        @media (max-width: 575px) {
          .social-container,
          .follow-us {
            margin-left: 0;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
