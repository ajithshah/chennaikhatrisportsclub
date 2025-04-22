import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Container, Card, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { auth, db } from "../../firebase";
import Header from "../Header";
import Meta from "../Meta";

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
  });
  const INDIAN_STATES = [
    "Tamil Nadu",
    "Karnataka",
    "Andhra Pradesh",
    "Kerala",
    "Telangana",
  ];
  const TAMIL_NADU_CITIES = [
    "Chennai",
    "Kanchipuram",
    "Vellore",
    "Vaniyambadi",
    "Coimbatore",
    "Tiruvallur",
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFormData({
            displayName: userData.displayName || user.displayName || "",
            phoneNumber: userData.phoneNumber || "",
            email: userData.email || "",
            dateOfBirth: userData.dateOfBirth || "",
            address: userData.address || {
              street: "",
              city: "",
              state: "",
              pincode: "",
            },
          });
        }
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate phone number
    if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      alert("Please enter a valid phone number");
      return;
    }

    setSaving(true);

    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <>
      <Meta title="Edit Profile" />
      <Header />
      <style jsx global>{`
        /* Base animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes expandWidth {
          from { width: 0; }
          to { width: 50px; }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
          100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Loading animation */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
          text-align: center;
        }
        
        .loading-spinner-container {
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 2rem;
        }
        
        .loading-spinner {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 4px solid rgba(13, 110, 253, 0.1);
          border-radius: 50%;
          border-top-color: #0d6efd;
          animation: spin 1s linear infinite;
        }
        
        .loading-spinner-inner {
          position: absolute;
          top: 15px;
          left: 15px;
          width: 50px;
          height: 50px;
          border: 4px solid rgba(13, 110, 253, 0.1);
          border-radius: 50%;
          border-top-color: #0d6efd;
          opacity: 0.7;
          animation: spin 0.8s linear infinite reverse;
        }
        
        .loading-text {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0d6efd;
          margin-bottom: 0.5rem;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.3s;
        }
        
        .loading-subtext {
          color: #6c757d;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.5s;
        }

        /* Form container styling */
        .edit-profile-container {
          padding: 3rem 1rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: calc(100vh - 56px);
        }
        
        .edit-profile-card {
          border-radius: 15px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          opacity: 0;
          transform: translateY(30px);
          animation: slideUp 0.8s ease forwards;
          border: none;
        }
        
        .edit-profile-card:hover {
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
          transition: all 0.5s ease;
        }
        
        .edit-card-body {
          padding: 2rem;
        }

        /* Header styling */        
        .card-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e9ecef;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.3s;
        }
        
        .card-title {
          position: relative;
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0;
          color: #212529;
        }
        
        .card-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          height: 3px;
          background: #0d6efd;
          border-radius: 3px;
          animation: expandWidth 0.8s ease forwards 0.6s;
        }
        
        /* Form section styling */        
        .form-section {
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.6s;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 1.25rem;
          color: #495057;
          position: relative;
          display: inline-block;
          padding-bottom: 0.5rem;
        }
        
        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 30px;
          height: 2px;
          background: #0d6efd;
          opacity: 0.7;
        }

        /* Form controls */
        .formGroup {
          margin-bottom: 1.5rem;
          opacity: 0;
          transform: translateX(20px);
          animation: slideInRight 0.5s ease forwards;
        }
        
        .formGroup:nth-child(1) { animation-delay: 0.7s; }
        .formGroup:nth-child(2) { animation-delay: 0.8s; }
        .formGroup:nth-child(3) { animation-delay: 0.9s; }
        .formGroup:nth-child(4) { animation-delay: 1s; }
        .formGroup:nth-child(5) { animation-delay: 1.1s; }
        .formGroup:nth-child(6) { animation-delay: 1.2s; }
        
        .form-label {
          font-weight: 600;
          color: #495057;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          display: block;
        }
        
        .requiredLabel::after {
          content: ' *';
          color: #dc3545;
        }
        
        .form-control, .form-select {
          border-radius: 8px;
          padding: 0.625rem 1rem;
          transition: all 0.3s ease;
          border: 1px solid #dee2e6;
          background-color: #f8f9fa;
        }
        
        .form-control:focus, .form-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
          background-color: #fff;
        }
        
        .form-control:disabled, .form-select:disabled {
          background-color: #e9ecef;
          opacity: 0.7;
        }
        
        textarea.form-control {
          resize: none;
        }
        
        .helperText {
          font-size: 0.8rem;
          color: #6c757d;
          margin-top: 0.5rem;
          display: block;
        }
        
        /* Button styling */
        .button-container {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 1rem;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 1.3s;
        }
        
        .action-button {
          border-radius: 50px;
          padding: 0.625rem 1.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .action-button:hover {
          transform: translateY(-3px);
        }
        
        .action-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }
        
        .action-button:hover::after {
          transform: translateX(100%);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          border: none;
          color: white;
          box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2);
        }
        
        .btn-primary:hover {
          box-shadow: 0 6px 10px rgba(13, 110, 253, 0.3);
        }
        
        .btn-outline-secondary {
          border: 1px solid #6c757d;
          color: #6c757d;
        }
        
        .btn-outline-secondary:hover {
          background-color: #6c757d;
          color: white;
        }
        
        .button-icon {
          margin-right: 0.5rem;
          transition: transform 0.3s;
        }
        
        .action-button:hover .button-icon {
          transform: translateY(-2px);
        }
        
        /* Saving spinner */
        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
          margin-right: 0.5rem;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .edit-profile-card {
            border-radius: 12px;
          }
          
          .edit-card-body {
            padding: 1.5rem;
          }
          
          .card-title {
            font-size: 1.5rem;
          }
          
          .button-container {
            flex-direction: column;
          }
          
          .action-button {
            width: 100%;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <div className="loading-spinner-inner"></div>
          </div>
          <h2 className="loading-text">Loading Your Profile</h2>
          <p className="loading-subtext">Please wait while we fetch your information...</p>
        </div>
      ) : (
        <div className="edit-profile-container">
          <Container>
            <Card className="edit-profile-card">
              <Card.Body className="edit-card-body">
                <div className="card-header-container">
                  <h2 className="card-title">Edit Profile</h2>
                  <Button
                    variant="outline-secondary"
                    onClick={() => router.back()}
                    className="rounded-pill action-button"
                  >
                    <i className="fas fa-arrow-left button-icon"></i>
                    Cancel
                  </Button>
                </div>
                
                <Form onSubmit={handleSubmit} className="form-section">
                  <Row className="g-4">
                    <Col md={6}>
                      <Form.Group className="formGroup">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleChange}
                          disabled={true}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="formGroup">
                        <Form.Label className="requiredLabel">
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phoneNumber"
                          required
                          pattern="^[6-9]\d{9}$"
                          title="Please enter a valid 10-digit Indian phone number"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          isInvalid={
                            formData.phoneNumber &&
                            !/^[6-9]\d{9}$/.test(formData.phoneNumber)
                          }
                          placeholder="Enter your 10-digit phone number"
                        />
                        <Form.Control.Feedback type="invalid">
                          Please enter a valid 10-digit Indian phone number starting
                          with 6-9
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="formGroup">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={true}
                        />
                      </Form.Group>

                      <Form.Group className="formGroup">
                        <Form.Label className="requiredLabel">Date of Birth</Form.Label>
                        <Form.Control
                          type="date"
                          required
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <h4 className="section-title">Address Information</h4>
                      <Row className="g-3">
                        <Col md={12}>
                          <Form.Group className="formGroup">
                            <Form.Label>Street Address</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              name="address.street"
                              value={formData.address.street}
                              onChange={handleChange}
                              placeholder="Enter your street address"
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="formGroup">
                            <Form.Label className="requiredLabel">
                              State
                            </Form.Label>
                            <Form.Select
                              name="address.state"
                              value={formData.address.state}
                              onChange={handleChange}
                              required
                            >
                              <option value="">Select State</option>
                              {INDIAN_STATES.map((state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="formGroup">
                            <Form.Label className="requiredLabel">
                              City
                            </Form.Label>
                            <Form.Select
                              name="address.city"
                              value={formData.address.city}
                              onChange={handleChange}
                              required
                              disabled={!formData.address.state}
                            >
                              <option value="">Select City</option>
                              {formData.address.state === "Tamil Nadu" &&
                                TAMIL_NADU_CITIES.map((city) => (
                                  <option key={city} value={city}>
                                    {city}
                                  </option>
                                ))}
                            </Form.Select>
                            {!formData.address.state && (
                              <Form.Text className="helperText">
                                Please select a state first
                              </Form.Text>
                            )}
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="formGroup">
                            <Form.Label className="requiredLabel">
                              Pincode
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="address.pincode"
                              value={formData.address.pincode}
                              onChange={handleChange}
                              pattern="^[1-9][0-9]{5}$"
                              placeholder="Enter 6-digit pincode"
                              required
                              isInvalid={
                                formData.address.pincode &&
                                !/^[1-9][0-9]{5}$/.test(formData.address.pincode)
                              }
                            />
                            <Form.Control.Feedback type="invalid">
                              Please enter a valid 6-digit pincode
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <div className="button-container">
                    <Button
                      type="submit"
                      variant="primary"
                      className="action-button"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner animation="border" size="sm" className="spinner-border-sm" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save button-icon"></i>
                          Save Changes
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline-secondary"
                      onClick={() => router.push("/profile")}
                      className="action-button"
                    >
                      <i className="fas fa-times button-icon"></i>
                      Discard Changes
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Container>
        </div>
      )}
    </>
  );
}