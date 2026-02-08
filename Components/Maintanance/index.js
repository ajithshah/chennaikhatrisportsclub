import React from "react";
import Head from "next/head";
import Image from "next/image";

const Maintenance = () => {
  return (
    <div className="maintenance-container">
      <Head>
        <title>Chennai Khatri Sports Club - Under Maintenance</title>
        <meta
          name="description"
          content="Chennai Khatri Sports Club is currently under maintenance. We'll be back soon!"
        />
      </Head>

      <div className="maintenance-content">
        <div className="logo-container">
          <Image
            src="/logo.png"
            alt="Chennai Khatri Sports Club Logo"
            width={150}
            height={150}
            className="maintenance-logo"
          />
        </div>

        <h1>We're Under Maintenance</h1>

        <div className="maintenance-message">
          <p>
            We're currently making some improvements to the Chennai Khatri
            Sports Club website.
          </p>
          <p>We'll be back online shortly. Thank you for your patience!</p>
        </div>

        <div className="maintenance-timer">
          <p>
            Expected completion: <span className="highlight">Soon</span>
          </p>
        </div>

        <div className="contact-info">
          <p>If you need immediate assistance, please contact us:</p>
          <p>
            Email:{" "}
            <a href="mailto:info@chennaikhatrisportsclub.com">
              info@chennaikhatrisportsclub.com
            </a>
          </p>
        </div>

        {/* Developer Info */}
        <div className="developer-info">
          <p>
            Developer Support:{" "}
            <a href="mailto:ajithshah37@gmail.com">
              ajithshah37@gmail.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a href="tel:+919962748001">
              +91 99627 48001
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .maintenance-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          background-size: cover;
          background-position: center;
          color: white;
          text-align: center;
        }

        .maintenance-content {
          background-color: rgba(0, 0, 0, 0.8);
          padding: 2rem;
          border-radius: 10px;
          max-width: 800px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .logo-container {
          margin-bottom: 2rem;
        }

        .maintenance-logo {
          border-radius: 50%;
          border: 3px solid white;
          padding: 5px;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          color: #f8bf02;
        }

        .maintenance-message {
          margin-bottom: 2rem;
          font-size: 1.2rem;
          line-height: 1.6;
        }

        .maintenance-timer {
          margin-bottom: 2rem;
          font-size: 1.2rem;
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .highlight {
          color: #f8bf02;
          font-weight: bold;
        }

        .contact-info {
          font-size: 1rem;
          opacity: 0.9;
          margin-bottom: 1.5rem;
        }

        .contact-info a {
          color: #f8bf02;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .contact-info a:hover {
          color: white;
          text-decoration: underline;
        }

        .developer-info {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px dashed rgba(255, 255, 255, 0.25);
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .developer-info a {
          color: #f8bf02;
          text-decoration: none;
        }

        .developer-info a:hover {
          color: white;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 2rem;
          }

          .maintenance-message {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Maintenance;
