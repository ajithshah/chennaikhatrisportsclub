import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto text-center">
        <h2 className="text-xl md:text-2xl font-semibold">
          Getting Profile Details
        </h2>
        <p className="text-gray-500">
          Please wait while we load your profile details...
        </p>
      </div>
    );
  }

  return (
    <>
      <Meta />
      <Header />
      <Container className="py-5">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0 fw-bold">Edit Profile</h2>
              <Button
                variant="outline-secondary"
                onClick={() => router.back()}
                className="rounded-pill px-4"
              >
                Cancel
              </Button>
            </div>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="formGroup">
                    <Form.Label>Name</Form.Label>
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
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid 10-digit Indian phone number starting
                      with 6-9
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="formGroup">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="tel"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={true}
                    />
                  </Form.Group>

                  <Form.Group className="formGroup">
                    <Form.Label>Date of Birth</Form.Label>
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
                  <h4 className="mt-4 mb-3">Address Details</h4>
                  <Row>
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
                        <Form.Label className="requiredLabel label">
                          State
                        </Form.Label>
                        <Form.Select
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          required
                          className="select"
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
                        <Form.Label className="requiredLabel label">
                          City
                        </Form.Label>
                        <Form.Select
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          required
                          disabled={!formData.address.state}
                          className="select"
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
                        {/* <Form.Label>Pincode</Form.Label> */}
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

              <div className="d-flex gap-3 mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="px-4 py-2 rounded-pill"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}