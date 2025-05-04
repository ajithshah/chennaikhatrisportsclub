import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
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
    photoURL: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [userAuthProvider, setUserAuthProvider] = useState("");
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    // Check file size - 400 KB = 400 * 1024 bytes
    if (file && file.size > 400 * 1024) {
      alert("File size exceeds 400 KB. Please select a smaller image.");
      e.target.value = null;
      return;
    }

    if (!file) return;

    // Validate file type
    const fileType = file.type;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(fileType)) {
      alert("Only JPG, JPEG and PNG images are allowed");
      return;
    }

    try {
      setImageUploading(true);

      // Get current user
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to upload a profile image");
      }

      // Create form data for upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload to the API with user ID in the query parameter
      const response = await fetch(`/api/profile_upload?userId=${user.uid}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const result = await response.json();

      // Update the form data with the new image URL
      setFormData((prev) => ({
        ...prev,
        photoURL: result.fileUrl,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const removeProfileImage = () => {
    setFormData((prev) => ({
      ...prev,
      photoURL: "",
    }));
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserAuthProvider(userData.providerId || ""); // Store the auth provider
          setFormData({
            displayName: userData.displayName || user.displayName || "",
            phoneNumber: userData.phoneNumber || "",
            email: userData.email || "",
            dateOfBirth: userData.dateOfBirth || "",
            photoURL: userData.photoURL || "",
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes borderPulse {
          0% {
            border-color: rgba(58, 123, 213, 0.7);
          }
          50% {
            border-color: rgba(58, 123, 213, 0.3);
          }
          100% {
            border-color: rgba(58, 123, 213, 0.7);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        /* Loading animation styling */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 75vh;
          text-align: center;
          background: linear-gradient(165deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .loading-spinner-container {
          position: relative;
          width: 100px;
          height: 100px;
          margin-bottom: 2.5rem;
        }

        .loading-spinner {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 5px solid rgba(58, 123, 213, 0.1);
          border-radius: 50%;
          border-top-color: #3a7bd5;
          animation: spin 1.2s linear infinite;
        }

        .loading-spinner-inner {
          position: absolute;
          top: 20px;
          left: 20px;
          width: 60px;
          height: 60px;
          border: 5px solid rgba(58, 123, 213, 0.15);
          border-radius: 50%;
          border-top-color: #3a7bd5;
          opacity: 0.7;
          animation: spin 0.8s linear infinite reverse;
        }

        .loading-text {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.8rem;
          opacity: 0;
          animation: fadeIn 0.6s ease forwards 0.3s;
          background: linear-gradient(90deg, #3a7bd5, #00d2ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .loading-subtext {
          color: #6c757d;
          font-size: 1.1rem;
          opacity: 0;
          animation: fadeIn 0.6s ease forwards 0.6s;
        }

        /* Main edit profile styles */
        .edit-profile-container {
          min-height: calc(100vh - 56px);
          background: linear-gradient(165deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 3rem 1rem;
        }

        .edit-profile-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          opacity: 0;
          animation: fadeIn 0.8s ease forwards;
        }

        .edit-profile-card {
          border: none;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          background: white;
          opacity: 0;
          animation: slideInUp 0.8s ease forwards;
        }

        .edit-profile-header {
          background: linear-gradient(135deg, #3a7bd5, #00d2ff);
          padding: 2rem;
          color: white;
          position: relative;
        }

        .edit-profile-header-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.1;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .edit-profile-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          position: relative;
          opacity: 0;
          animation: fadeIn 0.6s ease forwards 0.3s;
        }

        .edit-profile-subtitle {
          opacity: 0.8;
          margin-top: 0.5rem;
          font-size: 1.1rem;
          font-weight: 400;
          opacity: 0;
          animation: fadeIn 0.6s ease forwards 0.5s;
        }

        .edit-profile-body {
          padding: 2.5rem;
        }

        .section-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #3a7bd5;
          margin-bottom: 1.5rem;
          position: relative;
          display: inline-block;
          padding-left: 15px;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.6s;
        }

        .section-title::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
          background: linear-gradient(to bottom, #3a7bd5, #00d2ff);
          border-radius: 5px;
        }

        /* Form controls */
        .formGroup {
          margin-bottom: 1.5rem;
          opacity: 0;
        }

        .formGroup:nth-child(odd) {
          animation: slideInLeft 0.6s ease forwards
            calc(0.7s + (var(--i) * 0.1s));
        }

        .formGroup:nth-child(even) {
          animation: slideInRight 0.6s ease forwards
            calc(0.7s + (var(--i) * 0.1s));
        }

        .form-label {
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          color: #495057;
        }

        .form-label i {
          margin-right: 0.5rem;
          color: #3a7bd5;
        }

        .requiredLabel::after {
          content: " *";
          color: #dc3545;
          margin-left: 2px;
        }

        .form-control,
        .form-select {
          border-radius: 10px;
          padding: 0.7rem 1rem;
          transition: all 0.3s ease;
          border: 1px solid #dee2e6;
          background-color: #f8f9fa;
          font-size: 1rem;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #3a7bd5;
          box-shadow: 0 0 0 3px rgba(58, 123, 213, 0.25);
          background-color: #fff;
        }

        .form-control:disabled,
        .form-select:disabled {
          background-color: #e9ecef;
          opacity: 0.7;
        }

        textarea.form-control {
          resize: none;
        }

        .form-control.is-invalid,
        .form-select.is-invalid {
          border-color: #dc3545;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23dc3545' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
          background-position: right calc(0.375em + 0.1875rem) center;
          background-repeat: no-repeat;
          background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
        }

        .form-control.is-invalid:focus {
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
        }

        .invalid-feedback {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
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
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          opacity: 0;
          animation: fadeIn 0.6s ease forwards 1.3s;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .action-button {
          padding: 0.9rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          min-width: 180px;
          position: relative;
          overflow: hidden;
        }

        .action-button::after {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: -100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.3),
            rgba(255, 255, 255, 0)
          );
          transition: all 0.6s ease;
        }

        .action-button:hover::after {
          left: 100%;
        }

        .action-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .action-button i {
          margin-right: 0.75rem;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .action-button:hover i {
          transform: translateY(-3px);
        }

        .btn-save {
          background: linear-gradient(90deg, #3a7bd5, #00d2ff);
          border: none;
          color: white;
        }

        .btn-save:disabled {
          background: linear-gradient(90deg, #8bb0e6, #88dcf0);
          cursor: not-allowed;
          transform: none !important;
        }

        .btn-cancel {
          background: white;
          border: 2px solid #6c757d;
          color: #6c757d;
        }

        .btn-cancel:hover {
          background: linear-gradient(90deg, #6c757d, #495057);
          color: white;
          border-color: transparent;
        }

        .btn-discard {
          background: white;
          border: 2px solid #dc3545;
          color: #dc3545;
        }

        .btn-discard:hover {
          background: linear-gradient(90deg, #dc3545, #c82333);
          color: white;
          border-color: transparent;
        }

        /* Saving spinner */
        .spinner-border-sm {
          width: 1.1rem;
          height: 1.1rem;
          margin-right: 0.75rem;
          border-width: 0.2em;
        }

        /* Address section */
        .address-section {
          background-color: rgba(58, 123, 213, 0.05);
          border-radius: 15px;
          padding: 1.5rem;
          margin-top: 1rem;
          position: relative;
          overflow: hidden;
        }

        .address-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;
          background: linear-gradient(to bottom, #3a7bd5, #00d2ff);
        }

        /* Responsive styles */
        @media (max-width: 992px) {
          .edit-profile-header {
            padding: 1.75rem;
          }

          .edit-profile-title {
            font-size: 1.8rem;
          }

          .edit-profile-body {
            padding: 2rem;
          }

          .section-title {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 768px) {
          .edit-profile-container {
            padding: 1.5rem 0.5rem;
          }

          .edit-profile-header {
            padding: 1.5rem;
          }

          .edit-profile-title {
            font-size: 1.6rem;
          }

          .edit-profile-subtitle {
            font-size: 1rem;
          }

          .edit-profile-body {
            padding: 1.5rem;
          }

          .section-title {
            font-size: 1.2rem;
          }

          .button-container {
            flex-direction: column;
            gap: 0.8rem;
          }

          .action-button {
            width: 100%;
            min-width: auto;
          }
        }

        @media (max-width: 576px) {
          .edit-profile-header {
            padding: 1.25rem;
          }

          .edit-profile-title {
            font-size: 1.4rem;
          }

          .edit-profile-body {
            padding: 1.25rem;
          }

          .section-title {
            font-size: 1.1rem;
          }

          .form-label {
            font-size: 0.85rem;
          }

          .form-control,
          .form-select {
            padding: 0.6rem 0.9rem;
            font-size: 0.95rem;
          }

          .action-button {
            padding: 0.8rem 1rem;
            font-size: 1rem;
          }

          .address-section {
            padding: 1.25rem;
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
          <p className="loading-subtext">
            Please wait while we fetch your information...
          </p>
        </div>
      ) : (
        <div className="edit-profile-container">
          <div className="edit-profile-wrapper">
            <Card className="edit-profile-card">
              <div className="edit-profile-header">
                <div className="edit-profile-header-pattern"></div>
                <h1 className="edit-profile-title">Edit Your Profile</h1>
                <p className="edit-profile-subtitle">
                  Update your personal information and preferences
                </p>
              </div>

              <div className="edit-profile-body">
                <Form onSubmit={handleSubmit}>
                  <h3 className="section-title">Profile Image</h3>
                  <Row className="g-4 mb-4">
                    <Col lg={12}>
                      <div
                        className="profile-image-section formGroup d-flex flex-column align-items-center"
                        style={{ "--i": 0 }}
                      >
                        <div className="profile-image-container text-center">
                          <div className="current-image mx-auto">
                            {formData.photoURL ? (
                              <img
                                src={formData.photoURL}
                                alt="Profile"
                                className="profile-image"
                              />
                            ) : (
                              <div className="profile-image profile-image-placeholder d-flex align-items-center justify-content-center">
                                {formData.displayName
                                  ?.charAt(0)
                                  .toUpperCase() || "U"}
                              </div>
                            )}
                          </div>
                          <div className="upload-controls mt-3">
                            <label className="upload-button">
                              <i className="fas fa-camera"></i> Choose Image
                              <input
                                type="file"
                                accept="image/jpeg, image/png, image/jpg"
                                onChange={handleImageUpload}
                                style={{ display: "none" }}
                              />
                            </label>
                            {formData.photoURL && (
                              <button
                                type="button"
                                className="remove-image-btn"
                                onClick={removeProfileImage}
                              >
                                <i className="fas fa-trash-alt"></i> Remove
                              </button>
                            )}
                          </div>
                          {imageUploading && (
                            <div className="upload-progress">
                              <Spinner animation="border" size="sm" />
                              <span>Uploading image...</span>
                            </div>
                          )}
                        </div>
                        <span className="helperText text-center">
                          Upload a square image (JPG, PNG) for best results.
                          Maximum file size: 400KB
                        </span>
                      </div>
                    </Col>
                  </Row>

                  <h3 className="section-title">Personal Information</h3>

                  <Row className="g-4">
                    <Col lg={6}>
                      <Form.Group className="formGroup" style={{ "--i": 1 }}>
                        <Form.Label>
                          <i className="fas fa-user"></i>Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col lg={6}>
                      <Form.Group className="formGroup" style={{ "--i": 1 }}>
                        <Form.Label>
                          <i className="fas fa-envelope"></i> Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={userAuthProvider !== "phone"}
                        />
                        {userAuthProvider !== "phone" && (
                          <span className="helperText">
                            Email cannot be changed
                          </span>
                        )}
                        {userAuthProvider === "phone" && (
                          <span className="helperText">
                            You can update your email address as you logged in
                            with phone authentication
                          </span>
                        )}
                      </Form.Group>
                    </Col>

                    <Col lg={6}>
                      <Form.Group className="formGroup" style={{ "--i": 2 }}>
                        <Form.Label className="requiredLabel">
                          <i className="fas fa-phone-alt"></i> Phone Number
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
                          disabled={userAuthProvider !== "google.com"}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please enter a valid 10-digit Indian phone number
                          starting with 6-9
                        </Form.Control.Feedback>
                        {userAuthProvider !== "google.com" && (
                          <span className="helperText">
                            Phone number cannot be changed
                          </span>
                        )}
                      </Form.Group>
                    </Col>

                    <Col lg={6}>
                      <Form.Group className="formGroup" style={{ "--i": 2 }}>
                        <Form.Label className="requiredLabel">
                          <i className="fas fa-birthday-cake"></i> Date of Birth
                        </Form.Label>
                        <Form.Control
                          type="date"
                          required
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="address-section">
                    <h3 className="section-title">Address Information</h3>
                    <Row className="g-4">
                      <Col lg={12}>
                        <Form.Group className="formGroup" style={{ "--i": 3 }}>
                          <Form.Label>
                            <i className="fas fa-map-marker-alt"></i> Street
                            Address
                          </Form.Label>
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

                      <Col lg={4}>
                        <Form.Group className="formGroup" style={{ "--i": 4 }}>
                          <Form.Label className="requiredLabel">
                            <i className="fas fa-flag"></i> State
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

                      <Col lg={4}>
                        <Form.Group className="formGroup" style={{ "--i": 4 }}>
                          <Form.Label className="requiredLabel">
                            <i className="fas fa-city"></i> City
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
                            <span className="helperText">
                              Please select a state first
                            </span>
                          )}
                        </Form.Group>
                      </Col>

                      <Col lg={4}>
                        <Form.Group className="formGroup" style={{ "--i": 4 }}>
                          <Form.Label className="requiredLabel">
                            <i className="fas fa-map-pin"></i> Pincode
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
                  </div>

                  <div className="button-container">
                    <Button
                      type="submit"
                      variant="primary"
                      className="action-button btn-save"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="spinner-border-sm"
                          />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          Save Changes
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline-secondary"
                      onClick={() => router.push("/profile")}
                      className="action-button btn-cancel"
                    >
                      <i className="fas fa-arrow-left"></i>
                      Return to Profile
                    </Button>

                    <Button
                      variant="outline-secondary"
                      onClick={() => router.back()}
                      className="action-button btn-discard"
                    >
                      <i className="fas fa-times"></i>
                      Discard Changes
                    </Button>
                  </div>
                </Form>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
