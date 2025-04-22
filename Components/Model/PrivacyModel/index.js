import { Modal } from "react-bootstrap";
import { useEffect, useState } from "react";

const PrivacyModel = ({ show, onHide }) => {
  const [animate, setAnimate] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    if (show) {
      // Start animation after modal is visible
      const timer = setTimeout(() => setAnimate(true), 100);

      // Auto-highlight sections in sequence
      const highlightTimer = setTimeout(() => {
        const interval = setInterval(() => {
          setActiveSection((prev) => {
            if (prev === null || prev >= 3) return 0;
            return prev + 1;
          });
        }, 3000);

        return () => clearInterval(interval);
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearTimeout(highlightTimer);
      };
    } else {
      setAnimate(false);
      setActiveSection(null);
    }
  }, [show]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="privacy-modal"
      backdropClassName="privacy-backdrop"
    >
      <div className="modal-gradient-bg">
        <Modal.Header className="border-0 pb-0">
          <div className="w-100 position-relative">
            <Modal.Title className="text-2xl fw-bold text-primary ps-2 mb-0">
              Privacy Policy
            </Modal.Title>
            <div className="title-underline"></div>
          </div>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div
            className={`prose max-w-none content-container ${
              animate ? "animate" : ""
            }`}
          >
            <div
              className={`section-item ${activeSection === 0 ? "active" : ""}`}
            >
              <h2 className="text-xl font-semibold mb-3 privacy-heading">
                <span className="section-number">01</span> Acceptance of Terms
              </h2>
              <p className="mb-4 privacy-text">
                By accessing and using Chennai Khatri Sports Club services, you
                agree to be bound by these Terms of Service.
              </p>
            </div>

            <div
              className={`section-item ${activeSection === 1 ? "active" : ""}`}
            >
              <h2 className="text-xl font-semibold mb-3 privacy-heading">
                <span className="section-number">02</span> Membership
              </h2>
              <p className="mb-4 privacy-text">
                Membership is available to individuals who meet the eligibility
                criteria set by the club.
              </p>
            </div>

            <div
              className={`section-item ${activeSection === 2 ? "active" : ""}`}
            >
              <h2 className="text-xl font-semibold mb-3 privacy-heading">
                <span className="section-number">03</span> Code of Conduct
              </h2>
              <p className="mb-4 privacy-text">
                Members are expected to maintain appropriate behavior and follow
                club rules during all activities.
              </p>
            </div>

            <div
              className={`section-item ${activeSection === 3 ? "active" : ""}`}
            >
              <h2 className="text-xl font-semibold mb-3 privacy-heading">
                <span className="section-number">04</span> Privacy
              </h2>
              <p className="mb-4 privacy-text">
                Your use of our services is also governed by our Privacy Policy.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <button
            onClick={onHide}
            className="px-4 py-2 btn btn-primary rounded-pill close-btn"
          >
            <span className="btn-text">Close</span>
            <span className="btn-icon">×</span>
          </button>
        </Modal.Footer>
      </div>

      <style jsx>{`
        .modal-gradient-bg {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 1) 0%,
            rgba(245, 248, 255, 1) 100%
          );
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }

        .title-decoration {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 5px;
          height: 70%;
          background: linear-gradient(to bottom, #0d6efd, #0dcaf0);
          border-radius: 3px;
        }

        .title-underline {
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(to right, #0d6efd, transparent);
          animation: extendLine 1.5s ease-out forwards;
          animation-delay: 0.5s;
        }

        @keyframes extendLine {
          to {
            width: 100%;
          }
        }

        .section-number {
          display: inline-block;
          font-size: 0.9rem;
          font-weight: bold;
          color: #0d6efd;
          margin-right: 8px;
          opacity: 0.8;
        }

        .content-container {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s ease-out;
        }

        .content-container.animate {
          opacity: 1;
          transform: translateY(0);
        }

        .section-item {
          margin-bottom: 24px;
          padding: 10px 10px 10px 15px;
          border-left: 2px solid rgba(13, 110, 253, 0.1);
          border-radius: 8px;
          transition: all 0.5s ease;
        }

        .section-item.active {
          border-left-color: rgba(13, 110, 253, 0.7);
          background-color: rgba(13, 110, 253, 0.03);
          transform: translateX(5px);
          box-shadow: 0 2px 10px rgba(13, 110, 253, 0.07);
        }

        .section-item.active .privacy-heading {
          color: #0d6efd;
        }

        .privacy-heading {
          color: #333;
          transition: all 0.3s ease;
        }

        .privacy-text {
          color: #555;
          line-height: 1.6;
        }

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px rgba(13, 110, 253, 0.2);
          position: relative;
          overflow: hidden;
          animation: pulseButton 4s infinite;
        }

        @keyframes pulseButton {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 4px 10px rgba(13, 110, 253, 0.2);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 15px rgba(13, 110, 253, 0.3);
          }
        }

        .btn-icon {
          font-size: 1.2rem;
          animation: rotateIcon 8s infinite;
        }

        @keyframes rotateIcon {
          0%,
          80%,
          100% {
            transform: rotate(0);
          }
          85%,
          95% {
            transform: rotate(90deg);
          }
        }
      `}</style>

      <style jsx global>{`
        .privacy-modal .modal-content {
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .privacy-backdrop {
          backdrop-filter: blur(5px);
          background-color: rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </Modal>
  );
};

export default PrivacyModel;
