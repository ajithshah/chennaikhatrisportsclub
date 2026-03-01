import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Card, Row, Col, Badge, Button } from "react-bootstrap";
import { auth } from "../../../firebase";
import { usersDb } from "../../../lib/db";
import Image from "next/image";
import Meta from "@/Components/Meta";

export default function UserDetails({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  return (
    <>
      <Meta
        title={user ? `${user.displayName} | User Details` : "User Details"}
      />
      <style jsx global>{`
        /* Page transitions */
        .user-details-container {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.6s ease forwards;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Card styling */
        .user-card {
          border-radius: 12px;
          padding-top: 80px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .user-card:hover {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transform: translateY(-5px);
        }

        /* Profile image animations */
        .profile-image-container {
          position: relative;
          opacity: 0;
          transform: scale(0.9);
          animation: popIn 0.5s ease 0.3s forwards;
        }

        @keyframes popIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .profile-image,
        .profile-placeholder {
          transition: all 0.3s ease;
          position: relative;
        }

        .profile-image:hover,
        .profile-placeholder:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .profile-image::after,
        .profile-placeholder::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          box-shadow: 0 0 0 5px rgba(13, 110, 253, 0.2);
          opacity: 0;
          transition: all 0.3s ease;
        }

        .profile-image:hover::after,
        .profile-placeholder:hover::after {
          opacity: 1;
        }

        /* Section title animation */
        .section-title {
          position: relative;
          display: inline-block;
          opacity: 0;
          transform: translateY(-10px);
          animation: slideDown 0.5s ease 0.2s forwards;
        }

        @keyframes slideDown {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .section-title::after {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 40px;
          height: 3px;
          background: #0d6efd;
          transform: scaleX(0);
          transform-origin: left;
          animation: expandLine 0.5s ease 0.6s forwards;
        }

        @keyframes expandLine {
          to {
            transform: scaleX(1);
          }
        }

        /* Info items animation */
        .info-item {
          opacity: 0;
          transform: translateX(-10px);
          animation: slideIn 0.4s ease forwards;
        }

        .left-column .info-item:nth-child(1) {
          animation-delay: 0.4s;
        }
        .left-column .info-item:nth-child(2) {
          animation-delay: 0.5s;
        }
        .left-column .info-item:nth-child(3) {
          animation-delay: 0.6s;
        }
        .left-column .info-item:nth-child(4) {
          animation-delay: 0.7s;
        }
        .left-column .info-item:nth-child(5) {
          animation-delay: 0.8s;
        }

        .right-column .info-item:nth-child(1) {
          animation-delay: 0.5s;
        }
        .right-column .info-item:nth-child(2) {
          animation-delay: 0.6s;
        }

        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Info item styling */
        .info-label {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .info-value {
          background-color: #f8f9fa;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 1rem;
          margin-bottom: 0;
          transition: all 0.3s ease;
        }

        .info-value:hover {
          background-color: #e9ecef;
          transform: translateX(5px);
        }

        /* Role badge styling */
        .role-badge {
          padding: 8px 15px;
          font-size: 0.9rem;
          border-radius: 20px;
          display: inline-block;
          font-weight: 500;
          animation: pulsate 2s infinite;
        }

        @keyframes pulsate {
          0% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
          }
        }

        /* Back button styling */
        .back-button {
          opacity: 0;
          transform: translateY(10px);
          animation: fadeUp 0.5s ease 0.9s forwards;
          transition: all 0.3s ease;
          overflow: hidden;
          position: relative;
        }

        .back-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .back-button::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .back-button:hover::after {
          transform: translateX(100%);
        }

        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Loading animation */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
        }

        .spinner-wrapper {
          width: 60px;
          height: 60px;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .spinner {
          width: 100%;
          height: 100%;
          border: 3px solid rgba(13, 110, 253, 0.1);
          border-radius: 50%;
          border-top-color: #0d6efd;
          animation: spin 1s linear infinite;
        }

        .spinner-inner {
          position: absolute;
          top: 15px;
          left: 15px;
          width: 30px;
          height: 30px;
          border: 3px solid rgba(13, 110, 253, 0.1);
          border-radius: 50%;
          border-top-color: #0d6efd;
          opacity: 0.6;
          animation: spin 0.8s linear infinite reverse;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-text {
          font-size: 1.2rem;
          color: #6c757d;
          opacity: 0;
          animation: pulse 1.5s ease-in-out 0.3s infinite alternate;
        }

        @keyframes pulse {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      <Container className="py-5 user-details-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner-wrapper">
              <div className="spinner"></div>
              <div className="spinner-inner"></div>
            </div>
            <div className="loading-text">Loading user details...</div>
          </div>
        ) : user ? (
          <>
            <Card className="border-0 shadow user-card">
              <Card.Body className="p-4 p-md-5">
                <h2 className="section-title mb-4">User Profile Detail</h2>

                <div className="text-center mb-5 profile-image-container d-flex justify-content-center">
                  {user && user.photoURL ? (
                    <div className="position-relative d-inline-block">
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || "User profile"}
                        width={180}
                        height={180}
                        className="border shadow profile-image"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div
                      className="d-flex justify-content-center align-items-center bg-light mx-auto position-relative profile-placeholder"
                      style={{ width: 180, height: 180 }}
                    >
                      <span className="display-4 text-muted">
                        {user && user.displayName
                          ? user.displayName[0].toUpperCase()
                          : "?"}
                      </span>
                      <Badge
                        bg={user && user.isAdmin ? "danger" : "success"}
                        className="position-absolute bottom-0 end-0 px-3 py-2 text-light"
                      >
                        {user && user.isAdmin ? "Admin" : "Member"}
                      </Badge>
                    </div>
                  )}
                </div>

                <Row className="g-4">
                  <Col md={6} className="left-column">
                    <div className="info-item mb-4">
                      <div className="info-label">Full Name</div>
                      <div className="info-value">
                        {user.displayName || "Not provided"}
                      </div>
                    </div>

                    <div className="info-item mb-4">
                      <div className="info-label">Email Address</div>
                      <div className="info-value">
                        {user.email || "Not provided"}
                      </div>
                    </div>

                    <div className="info-item mb-4">
                      <div className="info-label">Phone Number</div>
                      <div className="info-value">
                        {user.phoneNumber || "Not provided"}
                      </div>
                    </div>

                    <div className="info-item mb-4">
                      <div className="info-label">Date of Birth</div>
                      <div className="info-value">
                        {user.dateOfBirth ? (
                          <>
                            {user.dateOfBirth}{" "}
                            <Badge bg="secondary" className="ms-2 text-light">
                              {calculateAge(user.dateOfBirth)} years old
                            </Badge>
                          </>
                        ) : (
                          "Not provided"
                        )}
                      </div>
                    </div>
                  </Col>

                  <Col md={6} className="right-column">
                    <div className="info-item mb-4">
                      <div className="info-label">Member Since</div>
                      <div className="info-value">
                        {user.createdAt || "Not available"}
                      </div>
                    </div>
                    <div className="info-item mb-4">
                      <div className="info-label">Blood Group</div>
                      <div className="info-value">
                        {user.bloodGroup || "Not available"}
                      </div>
                    </div>

                    <div className="info-item mb-4">
                      <div className="info-label">Address</div>
                      <div className="info-value">
                        {user.address ? (
                          <>
                            {user.address.street && `${user.address.street}`}
                            {user.address.city && (
                              <div className="mt-1">{user.address.city}</div>
                            )}
                            <div className="mt-1">
                              {user.address.state && `${user.address.state}`}
                              {user.address.pincode &&
                                ` - ${user.address.pincode}`}
                            </div>
                          </>
                        ) : (
                          "Not provided"
                        )}
                      </div>
                    </div>

                    <div className="info-item mb-4">
                      <div className="info-label">Access Level</div>
                      <div className="info-value">
                        <span
                          className={`role-badge ${
                            user.isAdmin ? "bg-danger" : "bg-success"
                          } text-white`}
                        >
                          {user.isAdmin ? "Administrator" : "Standard Member"}
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className="text-center mt-4">
                  <Button
                    variant="outline-primary"
                    className="rounded-pill px-4 py-2 back-button"
                    onClick={() => router.push("/adminpanel/users")}
                  >
                    <i className="fas fa-arrow-left me-2 mr-2"></i>
                    Back to Users List
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </>
        ) : (
          <div className="text-center py-5">
            <h3>User not found</h3>
            <p className="text-muted">
              The requested user could not be found or you don't have permission
              to view this profile.
            </p>
            <Button
              variant="primary"
              className="mt-3"
              onClick={() => router.push("/adminpanel/users")}
            >
              Return to Users List
            </Button>
          </div>
        )}
      </Container>
    </>
  );
}
