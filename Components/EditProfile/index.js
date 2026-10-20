import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import { auth } from "../../firebase";
import { usersDb } from "../../lib/db";
import Header from "../Header";
import Meta from "../Meta";
import styles from "./editProfile.module.css";

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
    bloodGroup: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [authPhoto, setAuthPhoto] = useState("");
  const BLOOD_GROUPS = [
    "A+", "A-", "A1+", "A1-", "A2+", "A2-", "B+", "B-",
    "AB+", "AB-", "A1B+", "A1B-", "A2B+", "A2B-", "O+", "O-",
  ];
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
        setAuthPhoto(user.photoURL || "");
        const userData = await usersDb.get(user.uid);

        if (userData) {
          setFormData({
            displayName: userData.displayName || user.displayName || "",
            phoneNumber: userData.phoneNumber || "",
            email: userData.email || "",
            dateOfBirth: userData.dateOfBirth || "",
            photoURL: userData.photoURL || "",
            bloodGroup: userData.bloodGroup || "",
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
        await usersDb.update(user.uid, {
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

  // Show the saved photo, else the Google account photo (not saved unless the user uploads one)
  const previewPhoto =
    formData.photoURL || (authPhoto ? authPhoto.replace(/=s\d+-c$/, "=s400-c") : "");

  return (
    <>
      <Meta title="Edit Profile" />
      <Header />
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <h2>Loading Your Profile</h2>
          <p>Please wait while we fetch your information...</p>
        </div>
      ) : (
        <div className={styles.page}>
          <section className={styles.hero}>
            <Container>
              <button
                type="button"
                className={styles.back}
                onClick={() => router.push("/profile")}
              >
                ← Back to profile
              </button>
              <h1 className={styles.title}>
                Edit Your <span>Profile</span>
              </h1>
              <p className={styles.subtitle}>
                Update your personal information and preferences
              </p>
            </Container>
          </section>

          <Container className={styles.content}>
            <Form onSubmit={handleSubmit}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <i className="fas fa-camera"></i> Profile Image
                </h3>
                <div className={styles.photoRow}>
                  <div className={styles.avatar}>
                    {previewPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewPhoto} alt="Profile" />
                    ) : (
                      <span>
                        {formData.displayName?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className={styles.photoActions}>
                    <div className={styles.photoButtons}>
                      <input
                        id="profile-photo-input"
                        type="file"
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={handleImageUpload}
                        className={styles.hiddenInput}
                        disabled={imageUploading}
                      />
                      <label
                        htmlFor="profile-photo-input"
                        className={styles.uploadBtn}
                      >
                        <i className="fas fa-cloud-upload-alt"></i> Choose Image
                      </label>
                      {formData.photoURL && (
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={removeProfileImage}
                        >
                          <i className="fas fa-trash-alt"></i> Remove
                        </button>
                      )}
                    </div>
                    {imageUploading && (
                      <div className={styles.uploading}>
                        <Spinner animation="border" size="sm" /> Uploading image...
                      </div>
                    )}
                    <p className={styles.helper}>
                      {!formData.photoURL && authPhoto
                        ? "Currently showing your Google photo. "
                        : ""}
                      Upload a square image (JPG, PNG) for best results.
                      Maximum file size: 400KB
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <i className="fas fa-user"></i> Personal Information
                </h3>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className={styles.label}>
                        <i className="fas fa-user"></i> Full Name
                        <span className={styles.req}> *</span>
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
                    <Form.Group className="mb-3">
                      <Form.Label className={styles.label}>
                        <i className="fas fa-envelope"></i> Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={true}
                      />
                      <span className={styles.helper}>Email cannot be changed</span>
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className={styles.label}>
                        <i className="fas fa-phone-alt"></i> Phone Number
                        <span className={styles.req}> *</span>
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
                        Please enter a valid 10-digit Indian phone number
                        starting with 6-9
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className={styles.label}>
                        <i className="fas fa-birthday-cake"></i> Date of Birth
                        <span className={styles.req}> *</span>
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

                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className={styles.label}>
                        <i className="fas fa-tint"></i> Blood Group
                      </Form.Label>
                      <Form.Select
                        name="bloodGroup"
                        value={formData.bloodGroup || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Blood Group</option>
                        {BLOOD_GROUPS.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <i className="fas fa-map-marker-alt"></i> Address Information
                </h3>
                <Row>
                  <Col lg={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className={styles.label}>
                        <i className="fas fa-map-marker-alt"></i> Street Address
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
                    <Form.Group className="mb-3">
                      <Form.Label className={styles.label}>
                        <i className="fas fa-flag"></i> State
                        <span className={styles.req}> *</span>
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
                    <Form.Group className="mb-3">
                      <Form.Label className={styles.label}>
                        <i className="fas fa-city"></i> City
                        <span className={styles.req}> *</span>
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
                        <span className={styles.helper}>
                          Please select a state first
                        </span>
                      )}
                    </Form.Group>
                  </Col>

                  <Col lg={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className={styles.label}>
                        <i className="fas fa-map-pin"></i> Pincode
                        <span className={styles.req}> *</span>
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

              <div className={styles.actions}>
                <Button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={saving || imageUploading}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save Changes
                    </>
                  )}
                </Button>

                <Button
                  variant="light"
                  onClick={() => router.push("/profile")}
                  className={styles.secondaryBtn}
                >
                  <i className="fas fa-arrow-left"></i> Return to Profile
                </Button>

                <Button
                  variant="light"
                  onClick={() => router.back()}
                  className={styles.secondaryBtn}
                >
                  <i className="fas fa-times"></i> Discard Changes
                </Button>
              </div>
            </Form>
          </Container>
        </div>
      )}
    </>
  );
}
