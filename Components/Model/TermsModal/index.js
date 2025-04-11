import { Modal } from "react-bootstrap";

const TermsModal = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="text-2xl font-bold">
          Terms of Service
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-6">
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using Chennai Khatri Sports Club services, you
            agree to be bound by these Terms of Service.
          </p>

          <h2 className="text-xl font-semibold mb-4">2. Membership</h2>
          <p className="mb-4">
            Membership is available to individuals who meet the eligibility
            criteria set by the club.
          </p>

          <h2 className="text-xl font-semibold mb-4">3. Code of Conduct</h2>
          <p className="mb-4">
            Members are expected to maintain appropriate behavior and follow
            club rules during all activities.
          </p>

          <h2 className="text-xl font-semibold mb-4">4. Privacy</h2>
          <p className="mb-4">
            Your use of our services is also governed by our Privacy Policy.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          onClick={onHide}
          className="px-4 py-2 btn btn-primary rounded-pill"
          style={{
            transition: "all 0.3s ease",
            transform: "translateY(0)",
            fontWeight: "500",
          }}
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default TermsModal;
