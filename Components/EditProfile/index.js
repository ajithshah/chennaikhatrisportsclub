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
  });

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
      alert("Please enter a valid Indian phone number");
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
                  <Form.Group className="mb-3">
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

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
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
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="tel"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={true}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
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
