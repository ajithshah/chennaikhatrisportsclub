import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Contact = () => {
  return (
    <section className="contact-section">
      {/* Hero */}
      <div className="contact-hero">
        <Container>
          <h1 className="hero-title">Contact Us</h1>
          <div className="title-underline"></div>
          <p className="hero-subtitle">
            Get in touch with Chennai Khatri Sports Club. We'd love to hear from you!
          </p>
        </Container>
      </div>

      {/* Contact Cards */}
      <Container>
        <Row className="g-4 justify-content-center card-row">
          {/* Phone Contacts */}
          <Col xs={12} md={6} lg={4}>
            <div className="contact-card">
              <div className="card-icon">
                <i className="fas fa-phone-alt"></i>
              </div>
              <h3 className="card-title">Call Us</h3>
              <div className="contact-list">
                <a href="tel:+919840880873" className="contact-item">
                  <div className="contact-info">
                    <span className="contact-name">Vinod Kumar</span>
                    <span className="contact-detail">+91 98408 80873</span>
                  </div>
                  <a
                    href="https://wa.me/919840880873"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fab fa-whatsapp"></i>
                  </a>
                </a>
                <a href="tel:+919841712284" className="contact-item">
                  <div className="contact-info">
                    <span className="contact-name">Sushil</span>
                    <span className="contact-detail">+91 98417 12284</span>
                  </div>
                  <a
                    href="https://wa.me/919841712284"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fab fa-whatsapp"></i>
                  </a>
                </a>
                <a href="tel:+919841526709" className="contact-item">
                  <div className="contact-info">
                    <span className="contact-name">Rajini</span>
                    <span className="contact-detail">+91 98415 26709</span>
                  </div>
                  <a
                    href="https://wa.me/919841526709"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fab fa-whatsapp"></i>
                  </a>
                </a>
              </div>
            </div>
          </Col>

          {/* Social Media */}
          <Col xs={12} md={6} lg={4}>
            <div className="contact-card">
              <div className="card-icon">
                <i className="fas fa-share-alt"></i>
              </div>
              <h3 className="card-title">Follow Us</h3>
              <div className="contact-list">
                <a
                  href="https://www.instagram.com/chennai_khatri_sports.club?igsh=azVtaWhnMDRmNnpz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item social"
                >
                  <i className="fab fa-instagram social-icon-inline instagram"></i>
                  <div className="contact-info">
                    <span className="contact-name">Instagram</span>
                    <span className="contact-detail">@chennai_khatri_sports.club</span>
                  </div>
                </a>
                <a
                  href="https://www.youtube.com/@KhatriSportsClub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item social"
                >
                  <i className="fab fa-youtube social-icon-inline youtube"></i>
                  <div className="contact-info">
                    <span className="contact-name">YouTube</span>
                    <span className="contact-detail">Khatri Sports Club</span>
                  </div>
                </a>
              </div>
            </div>
          </Col>

          {/* Location */}
          <Col xs={12} md={6} lg={4}>
            <div className="contact-card">
              <div className="card-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3 className="card-title">Location</h3>
              <div className="contact-list">
                <div className="contact-item location">
                  <i className="fas fa-city location-icon"></i>
                  <div className="contact-info">
                    <span className="contact-name">Address</span>
                    <span className="contact-detail">Chintadripet, Chennai 600002</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Google Map */}
        <Row className="g-4 mt-4">
          <Col xs={12}>
            <div className="map-card">
              <h3 className="info-title">
                <i className="fas fa-map info-icon"></i>
                Find Us on the Map
              </h3>
              <div className="map-wrapper">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1628.361154557572!2d80.26993498366706!3d13.076157693893927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526606bbdd9bc1%3A0x6adc3e959beba61d!2s48-78%2C%20Iyya%20Mudali%20St%2C%20Adikesavarpuram%2C%20Chintadripet%2C%20Chennai%2C%20Tamil%20Nadu%20600002!5e0!3m2!1sen!2sin!4v1772866214507!5m2!1sen!2sin"
                  width="100%"
                  height="350"
                  style={{ border: 0, borderRadius: "12px" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Chennai Khatri Sports Club Location"
                ></iframe>
              </div>
            </div>
          </Col>
        </Row>

        {/* About & Sports Section */}
        <Row className="g-4 mt-4">
          {/* About the Club */}
          <Col xs={12} lg={6}>
            <div className="info-card">
              <h3 className="info-title">
                <i className="fas fa-info-circle info-icon"></i>
                About the Club
              </h3>
              <p className="info-text">
                Established in <strong>2023</strong>, the Chennai Khatri Sports Club was founded
                to bring the Khatri community together through sports. Our mission is to foster
                unity, teamwork, and an active lifestyle by moving beyond screens and onto the field.
              </p>
              <p className="info-text">
                Founded by <strong>Kamal, Rajini, Vinod Kumar</strong> and <strong>Sushil</strong>,
                the club has grown into a thriving community of sports enthusiasts.
              </p>
            </div>
          </Col>

          {/* Sports & Seasons */}
          <Col xs={12} lg={6}>
            <div className="info-card">
              <h3 className="info-title">
                <i className="fas fa-trophy info-icon"></i>
                Sports & Achievements
              </h3>
              <div className="sports-list">
                <div className="sport-item">
                  <div className="sport-icon cricket">
                    <i className="fas fa-baseball-ball"></i>
                  </div>
                  <div className="sport-info">
                    <span className="sport-name">Khatri Premier League (Cricket)</span>
                    <span className="sport-detail">3 Seasons completed successfully</span>
                  </div>
                </div>
                <div className="sport-item">
                  <div className="sport-icon badminton">
                    <i className="fas fa-table-tennis"></i>
                  </div>
                  <div className="sport-info">
                    <span className="sport-name">Badminton</span>
                    <span className="sport-detail">1 Season completed</span>
                  </div>
                </div>
                <div className="sport-item">
                  <div className="sport-icon upcoming">
                    <i className="fas fa-futbol"></i>
                  </div>
                  <div className="sport-info">
                    <span className="sport-name">Ladies & Kids Events</span>
                    <span className="sport-detail">Coming soon</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats Section */}
        <Row className="g-4 mt-4">
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="stat-number">3</div>
              <div className="stat-label">Cricket Seasons</div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="stat-number">100+</div>
              <div className="stat-label">Active Members</div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="stat-number">8+</div>
              <div className="stat-label">Teams</div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="stat-number">2</div>
              <div className="stat-label">Sports Played</div>
            </div>
          </Col>
        </Row>

        {/* Club Values */}
        <Row className="g-4 mt-4">
          <Col xs={12}>
            <div className="info-card">
              <h3 className="info-title">
                <i className="fas fa-heart info-icon"></i>
                Our Values
              </h3>
              <Row className="g-3">
                <Col xs={12} sm={6} md={3}>
                  <div className="value-item">
                    <div className="value-icon" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
                      <i className="fas fa-hands-helping"></i>
                    </div>
                    <h4 className="value-name">Unity</h4>
                    <p className="value-desc">Bringing the Khatri community together through the power of sports</p>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="value-item">
                    <div className="value-icon" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
                      <i className="fas fa-users"></i>
                    </div>
                    <h4 className="value-name">Teamwork</h4>
                    <p className="value-desc">Building strong bonds on and off the field with every match</p>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="value-item">
                    <div className="value-icon" style={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
                      <i className="fas fa-heartbeat"></i>
                    </div>
                    <h4 className="value-name">Fitness</h4>
                    <p className="value-desc">Promoting an active lifestyle and healthy habits for all ages</p>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="value-item">
                    <div className="value-icon" style={{ background: "linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)" }}>
                      <i className="fas fa-star"></i>
                    </div>
                    <h4 className="value-name">Excellence</h4>
                    <p className="value-desc">Striving for the best in every event and tournament we organize</p>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>


        {/* Join Us CTA */}
        <div className="cta-section">
          <div className="cta-card">
            <h3 className="cta-title">Want to Join the Club?</h3>
            <p className="cta-text">
              Whether you're a seasoned player or just starting out, we welcome everyone
              from the Khatri community. Reach out to any of our organizers to get started!
            </p>
            <div className="cta-buttons">
              <a
                href="https://wa.me/919840880873?text=Hi%2C%20I%20am%20interested%20in%20joining%20Chennai%20Khatri%20Sports%20Club"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-btn whatsapp"
              >
                <i className="fab fa-whatsapp"></i> Message on WhatsApp
              </a>
              <a href="tel:+919840880873" className="cta-btn call">
                <i className="fas fa-phone-alt"></i> Call Now
              </a>
              <a
                href="https://www.instagram.com/chennai_khatri_sports.club?igsh=azVtaWhnMDRmNnpz"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-btn instagram"
              >
                <i className="fab fa-instagram"></i> Follow on Instagram
              </a>
            </div>
          </div>
        </div>
      </Container>

      <style jsx>{`
        .contact-section {
          min-height: 80vh;
          background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
          padding-bottom: 60px;
        }

        .contact-hero {
          padding: 120px 0 50px;
          text-align: center;
        }

        .hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          color: #2d3748;
          margin-bottom: 12px;
        }

        .title-underline {
          height: 4px;
          width: 80px;
          background: linear-gradient(to right, #667eea, #764ba2);
          margin: 0 auto 16px;
          border-radius: 2px;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: #718096;
          max-width: 500px;
          margin: 0 auto;
        }

        .card-row {
          margin-top: 10px;
        }

        .contact-card {
          background: #fff;
          border-radius: 16px;
          padding: 28px 22px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          height: 100%;
          text-align: center;
        }

        .contact-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
        }

        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
          font-size: 1.3rem;
          color: white;
        }

        .card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 18px;
        }

        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          background: #f7fafc;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .contact-item:hover {
          background: #edf2f7;
        }

        .contact-item.social {
          gap: 12px;
        }

        .contact-item.location {
          cursor: default;
          gap: 12px;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }

        .whatsapp-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #25d366;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          text-decoration: none;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .whatsapp-btn:hover {
          background: #1da851;
          transform: scale(1.1);
        }

        .social-icon-inline {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .social-icon-inline.instagram {
          color: #e1306c;
        }

        .social-icon-inline.youtube {
          color: #ff0000;
        }

        .location-icon {
          font-size: 1.3rem;
          color: #667eea;
          flex-shrink: 0;
        }

        .contact-name {
          font-size: 0.7rem;
          color: #a0aec0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .contact-detail {
          font-size: 0.92rem;
          color: #2d3748;
          font-weight: 500;
        }

        /* Map */
        .map-card {
          background: #fff;
          border-radius: 16px;
          padding: 28px 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }

        .map-wrapper {
          margin-top: 12px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }

        /* Info Cards */
        .info-card {
          background: #fff;
          border-radius: 16px;
          padding: 28px 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          height: 100%;
        }

        .info-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .info-icon {
          color: #667eea;
          font-size: 1.1rem;
        }

        .info-text {
          font-size: 0.95rem;
          color: #4a5568;
          line-height: 1.7;
          margin-bottom: 12px;
        }

        .info-text:last-child {
          margin-bottom: 0;
        }

        /* Sports List */
        .sports-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sport-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #f7fafc;
        }

        .sport-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          color: white;
          flex-shrink: 0;
        }

        .sport-icon.cricket {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .sport-icon.badminton {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .sport-icon.upcoming {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .sport-info {
          display: flex;
          flex-direction: column;
        }

        .sport-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #2d3748;
        }

        .sport-detail {
          font-size: 0.78rem;
          color: #718096;
        }

        /* CTA Section */
        .cta-section {
          margin-top: 30px;
        }

        .cta-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 36px 30px;
          text-align: center;
          color: white;
        }

        .cta-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .cta-text {
          font-size: 0.95rem;
          opacity: 0.9;
          max-width: 550px;
          margin: 0 auto 24px;
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 30px;
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .cta-btn.whatsapp {
          background: #25d366;
          color: white;
        }

        .cta-btn.whatsapp:hover {
          background: #1da851;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
        }

        .cta-btn.call {
          background: white;
          color: #667eea;
        }

        .cta-btn.call:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
        }

        .cta-btn.instagram {
          background: linear-gradient(135deg, #f093fb 0%, #e1306c 100%);
          color: white;
        }

        .cta-btn.instagram:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(225, 48, 108, 0.4);
        }

        /* Stats */
        .stat-card {
          background: #fff;
          border-radius: 14px;
          padding: 24px 16px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
          font-size: 2.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #718096;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }

        /* Values */
        .value-item {
          text-align: center;
          padding: 16px 10px;
          border-radius: 12px;
          background: #f7fafc;
          height: 100%;
        }

        .value-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          font-size: 1.1rem;
          color: white;
        }

        .value-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 6px;
        }

        .value-desc {
          font-size: 0.8rem;
          color: #718096;
          line-height: 1.5;
          margin: 0;
        }



        @media (max-width: 768px) {
          .contact-hero {
            padding: 90px 0 30px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 0.95rem;
          }

          .card-icon {
            width: 48px;
            height: 48px;
            font-size: 1.1rem;
            margin-bottom: 10px;
          }

          .card-title {
            font-size: 1.05rem;
            margin-bottom: 14px;
          }

          .contact-item {
            padding: 8px 12px;
          }

          .whatsapp-btn {
            width: 32px;
            height: 32px;
            font-size: 1rem;
          }

          .social-icon-inline {
            font-size: 1.3rem;
          }

          .info-title {
            font-size: 1.1rem;
          }

          .info-text {
            font-size: 0.9rem;
          }

          .sport-item {
            padding: 10px 12px;
          }

          .sport-icon {
            width: 36px;
            height: 36px;
            font-size: 0.9rem;
          }

          .sport-name {
            font-size: 0.85rem;
          }

          .sport-detail {
            font-size: 0.72rem;
          }

          .stat-number {
            font-size: 1.8rem;
          }

          .stat-label {
            font-size: 0.7rem;
          }

          .value-icon {
            width: 40px;
            height: 40px;
            font-size: 0.95rem;
            margin-bottom: 8px;
          }

          .value-name {
            font-size: 0.88rem;
            margin-bottom: 4px;
          }

          .value-desc {
            font-size: 0.75rem;
          }

          .cta-title {
            font-size: 1.3rem;
          }

          .cta-text {
            font-size: 0.9rem;
          }

          .cta-btn {
            padding: 10px 20px;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 576px) {
          .contact-section {
            padding-bottom: 40px;
          }

          .contact-hero {
            padding: 76px 0 20px;
          }

          .hero-title {
            font-size: 1.6rem;
          }

          .title-underline {
            width: 60px;
            height: 3px;
            margin-bottom: 12px;
          }

          .hero-subtitle {
            font-size: 0.85rem;
          }

          .contact-card,
          .info-card,
          .map-card {
            padding: 18px 14px;
            border-radius: 12px;
          }

          .card-icon {
            width: 42px;
            height: 42px;
            font-size: 1rem;
            margin-bottom: 8px;
          }

          .card-title {
            font-size: 1rem;
            margin-bottom: 12px;
          }

          .contact-list {
            gap: 8px;
          }

          .contact-item {
            padding: 8px 10px;
            border-radius: 8px;
            gap: 8px;
          }

          .contact-name {
            font-size: 0.6rem;
          }

          .contact-detail {
            font-size: 0.82rem;
          }

          .whatsapp-btn {
            width: 30px;
            height: 30px;
            font-size: 0.9rem;
          }

          .social-icon-inline {
            font-size: 1.2rem;
          }

          .location-icon {
            font-size: 1.1rem;
          }

          .map-wrapper {
            margin-top: 8px;
            border-radius: 8px;
          }

          .info-title {
            font-size: 1rem;
            gap: 8px;
            margin-bottom: 12px;
          }

          .info-icon {
            font-size: 0.95rem;
          }

          .info-text {
            font-size: 0.85rem;
            line-height: 1.6;
            margin-bottom: 10px;
          }

          .sport-item {
            padding: 8px 10px;
            gap: 10px;
            border-radius: 8px;
          }

          .sport-icon {
            width: 34px;
            height: 34px;
            font-size: 0.85rem;
            border-radius: 8px;
          }

          .sport-name {
            font-size: 0.82rem;
          }

          .sport-detail {
            font-size: 0.68rem;
          }

          .sports-list {
            gap: 8px;
          }

          .stat-card {
            padding: 16px 10px;
            border-radius: 10px;
          }

          .stat-number {
            font-size: 1.5rem;
          }

          .stat-label {
            font-size: 0.6rem;
            letter-spacing: 0.3px;
          }

          .value-item {
            padding: 12px 8px;
            border-radius: 10px;
          }

          .value-icon {
            width: 36px;
            height: 36px;
            font-size: 0.85rem;
            margin-bottom: 6px;
          }

          .value-name {
            font-size: 0.82rem;
            margin-bottom: 3px;
          }

          .value-desc {
            font-size: 0.7rem;
            line-height: 1.4;
          }

          .cta-section {
            margin-top: 20px;
          }

          .cta-card {
            padding: 24px 16px;
            border-radius: 12px;
          }

          .cta-title {
            font-size: 1.15rem;
          }

          .cta-text {
            font-size: 0.82rem;
            margin-bottom: 18px;
          }

          .cta-buttons {
            gap: 8px;
          }

          .cta-btn {
            padding: 10px 18px;
            font-size: 0.82rem;
            border-radius: 25px;
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;
