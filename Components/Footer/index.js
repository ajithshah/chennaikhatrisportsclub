import React from "react";
import Link from "next/link";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="footer position-relative">
      
      <div className="footer-bottom">
        <Container className="text-center">
          <p className="copyright mb-1">
            © {new Date().getFullYear()} Chennai Khatri Sports Club. All rights reserved.
          </p>
        </Container>
      </div>
      
      <style jsx>{`
        .footer {
          background: linear-gradient(to right, #0a2540, #0d6efd);
          color: white;
          z-index: 10;
          position: relative;
        }
        
        .footer-top {
          padding: 2rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .footer-bottom {
          padding: 1.5rem 0;
          background-color: rgba(0, 0, 0, 0.1);
        }
        
        .footer-logo {
          display: inline-block;
        }
        
        .logo-text {
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
          letter-spacing: 2px;
        }
        
        .social-icons {
          display: flex;
          justify-content: center;
          gap: 1rem;
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
        
        .footer-nav {
          display: flex;
          justify-content: flex-end;
          gap: 1.5rem;
        }
        
        .footer-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        
        .footer-link:hover {
          color: white;
        }
        
        .copyright {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .developer-credit {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .developer-name {
          color: white;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .footer-nav {
            justify-content: center;
            margin-top: 1rem;
          }
          
          .logo-text {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;