import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Image from "next/image";
import Meta from "../Meta";

const AboutUs = () => {
  const founders = [
    {
      id: 1,
      name: "Rajini",
      image: "/founder2.jpeg",
    },
    {
      id: 2,
      name: "Vinod Kumar",
      image: "/founder3.jpeg",
    },
    {
      id: 3,
      name: "Sushil",
      image: "/founder1.jpeg",
    },
  ];

  return (
    <>
      <Meta title="About Us | Chennai Khatri Sports Club" />
      <div className="about-container">
        <div className="about-hero">
          <Container>
            <h1 className="about-title text-primary">About Us</h1>
            <div className="title-underline"></div>
          </Container>
        </div>

        <section className="about-section">
          <Container>
            <Row className="g-4">
              <Col lg={6} md={12}>
                <div className="about-content">
                  <h2 className="section-title">How it all Began!!</h2>
                  <p className="about-text">
                    Established in 2023, the Chennai Khatri Sports Club began
                    with a simple yet powerful idea: to break the monotony of
                    mobile phone usage and reignite a passion for outdoor games.
                    This vision, initially shared by Mr. V. Kamal and Mr. G.
                    Rajini, soon gained momentum as Mr. B.G. Vinod and Mr. B.S.
                    Sushil joined hands to bring it to life.
                  </p>
                  <p className="about-text">
                    Our mission is to bring the Khatri community together
                    through sports, fostering unity, teamwork, and an active
                    lifestyle. Since our inception, we have proudly completed
                    two successful seasons of the Khatri Premier League and one
                    season of badminton, with many more milestones to come.
                  </p>
                </div>
              </Col>
              <Col lg={6} md={12}>
                <div className="about-image-container">
                  <div className="about-image">
                    <Image
                      src="/cricket.png"
                      alt="Chennai Khatri Sports Club"
                      width={500}
                      height={350}
                      className="img-fluid rounded shadow"
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="mission-section">
          <Container>
            <Row className="g-4">
              <Col lg={6} md={12} className="order-lg-2">
                <div className="mission-content">
                  <h2 className="section-title">Our Mission</h2>
                  <p className="about-text">
                    Moving forward, we are thrilled to expand our focus by
                    organizing special sports events for the ladies and kids of
                    our community, creating opportunities for everyone to
                    connect, participate, and grow.
                  </p>
                  <p className="about-text">
                    At Chennai Khatri Sports Club, sports are more than just
                    games—they are a way to build bonds, promote health, and
                    strengthen our community spirit.
                  </p>
                  <p className="about-text">
                    <strong>
                      Join us as we continue to grow, play, and inspire
                      together!
                    </strong>
                  </p>
                </div>
              </Col>
              <Col lg={6} md={12} className="order-lg-1">
                <div className="mission-image-container">
                  <div className="mission-image">
                    <div className="video-wrapper">
                      <video
                        autoPlay
                        muted
                        loop
                        className="img-fluid rounded shadow"
                      >
                        <source src="/video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="founders-section">
          <Container>
            <h2 className="section-title text-center">Organizers</h2>
            <div className="title-underline mx-auto"></div>
            <p className="text-center mb-5 founders-description">
              Meet the visionaries who came together to create the Chennai
              Khatri Sports Club
            </p>

            <Row className="g-4 justify-content-center">
              {founders.map((founder) => (
                <Col
                  key={founder.id}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  className="mb-4 d-flex justify-content-center"
                >
                  <Card
                    className="founder-card h-100"
                    style={{ maxWidth: "300px" }}
                  >
                    <div className="founder-image-container">
                      <Image
                        src={founder.image}
                        alt={founder.name}
                        width={200}
                        height={200}
                        className="founder-image text-primary"
                        style={{
                          border: "4px solid #0d6efd",
                          borderRadius: "50%",
                        }}
                      />
                    </div>
                    <Card.Body className="text-center">
                      <Card.Title className="founder-name">
                        {founder.name}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      </div>

      <style jsx>{`
        .about-container {
          min-height: 100vh;
          position: relative;
          padding-top: 56px;
        }

        .about-hero {
          background-size: cover;
          background-position: center;
          padding: 6rem 0;
          color: white;
          text-align: center;
          margin-bottom: 3rem;
        }

        .about-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          animation: fadeIn 1s ease-in-out;
        }

        .title-underline {
          height: 4px;
          width: 100px;
          background-color: #0d6efd;
          margin: 0 auto;
          border-radius: 2px;
          animation: expandWidth 1.5s ease;
        }

        .section-title {
          position: relative;
          font-size: 2.2rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #212529;
          animation: fadeIn 1s ease-in-out;
        }

        .about-section,
        .mission-section {
          padding: 5rem 0;
        }

        .mission-section {
          background-color: #f8f9fa;
        }

        .about-text {
          color: #6c757d;
          font-size: 1.1rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
          animation: fadeIn 1.5s ease;
        }

        .about-image-container,
        .mission-image-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }

        .about-image,
        .mission-image {
          position: relative;
          width: 100%;
          height: auto;
          border-radius: 10px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          animation: slideInRight 1s ease;
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          height: auto;
          overflow: hidden;
          border-radius: 10px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .founders-section {
          padding: 5rem 0;
          background-color: white;
        }

        .founders-description {
          color: #6c757d;
          font-size: 1.1rem;
          max-width: 700px;
          margin: 0 auto;
        }

        .founder-card {
          border-radius: 15px;
          overflow: hidden;
          border: none;
          background-color: white;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          animation: fadeIn 1.5s ease;
        }

        .founder-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }

        .founder-image-container {
          overflow: hidden;
          padding: 1.5rem;
          display: flex;
          justify-content: center;
        }

        .founder-image {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .founder-card:hover .founder-image {
          transform: scale(1.1);
        }

        .founder-name {
          font-weight: 600;
          font-size: 1.3rem;
          color: #212529;
        }

        .founder-role {
          color: #0d6efd;
          font-weight: 500;
        }

        .milestones-section {
          padding: 5rem 0;
          background: linear-gradient(to right, #f8f9fa, #e9ecef);
        }

        .timeline {
          position: relative;
          max-width: 800px;
          margin: 3rem auto 0;
          padding: 2rem 0;
        }

        .timeline:before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 4px;
          background: #0d6efd;
          transform: translateX(-50%);
          border-radius: 2px;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 2.5rem;
          display: flex;
          animation: fadeIn 1.5s ease;
        }

        .timeline-marker {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          background: #0d6efd;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.2);
          z-index: 1;
        }

        .timeline-content {
          width: 45%;
          padding: 1.5rem;
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .timeline-content:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }

        .timeline-item:nth-child(odd) .timeline-content {
          margin-left: auto;
        }

        .timeline-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #0d6efd;
          margin-bottom: 0.5rem;
        }

        .timeline-content p {
          margin-bottom: 0;
          color: #6c757d;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes expandWidth {
          from {
            width: 0;
          }
          to {
            width: 100px;
          }
        }

        /* Mobile Responsiveness */
        @media (max-width: 992px) {
          .about-title {
            font-size: 2.8rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .timeline:before {
            left: 30px;
          }

          .timeline-marker {
            left: 30px;
          }

          .timeline-content {
            width: 85%;
            margin-left: 60px !important;
          }
        }

        @media (max-width: 768px) {
          .about-title {
            font-size: 2.5rem;
          }

          .section-title {
            font-size: 1.8rem;
          }

          .about-text {
            font-size: 1rem;
          }

          .about-section,
          .mission-section,
          .founders-section,
          .milestones-section {
            padding: 3rem 0;
          }

          .about-hero {
            padding: 4rem 0;
          }
        }

        @media (max-width: 576px) {
          .about-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 1.5rem;
            text-align: center;
          }

          .timeline-content {
            width: 80%;
            padding: 1rem;
          }

          .founder-image {
            width: 120px;
            height: 120px;
          }

          .founder-name {
            font-size: 1.1rem;
          }

          .video-wrapper {
            margin-top: 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default AboutUs;
