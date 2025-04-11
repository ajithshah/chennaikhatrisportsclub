import React, { useState, useEffect } from "react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import { useRouter } from "next/router";
import { auth } from "../firebase";
import TermsModal from "@/Components/Model/TermsModal";
import PrivacyModel from "@/Components/Model/PrivacyModel";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModel, setShowPrivacyModel] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      setShowSuccess(true);
      setUser(result.user);
      router.push("/");

      // setTimeout(() => {
      //   router.push("/");
      // }, 1500);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Meta />
        <Header />
        <main className="flex-grow-1">
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-block p-3 rounded-full bg-blue-50 mb-4">
                  <Image
                    src="/logo.png"
                    alt="Chennai Khatri Sports Club"
                    width={300}
                    height={300}
                    className="object-contain"
                    priority
                  />
                </div>
                <h1 className="text-4xl font-bold mb-3 text-gray-800 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Welcome, {user.displayName}
                </h1>
                <p className="text-gray-600 text-lg mb-8">
                  Join our community of sports enthusiasts and stay updated with
                  latest events
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <Header />
      <main className="flex-grow-1">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div
              className={`bg-white rounded-3xl shadow-xl p-8 transform transition-all duration-300 ${
                showSuccess ? "scale-105 bg-green-50" : "hover:scale-105"
              }`}
            >
              {!showSuccess && (
                <>
                  <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-full bg-blue-50 mb-4">
                      <Image
                        src="/logo.png"
                        alt="Chennai Khatri Sports Club"
                        width={300}
                        height={300}
                        className="object-contain"
                        priority
                      />
                    </div>
                    <h1 className="text-4xl font-bold mb-3 text-gray-800 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                      Welcome to Chennai Khatri Sports Club
                    </h1>
                    <p className="text-gray-600 text-lg mb-8">
                      Join our community of sports enthusiasts and stay updated
                      with latest events
                    </p>
                    <div className="mt-8 text-center">
                      <p className="text-sm text-gray-500">
                        By signing in, you agree to our{" "}
                        <a
                          onClick={() => setShowTermsModal(true)}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          onClick={() => setShowPrivacyModel(true)}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Privacy Policy
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      onClick={signInWithGoogle}
                      disabled={isLoading}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl gap-3 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 btn btn-primary rounded-pill"
                      style={{
                        transition: "all 0.3s ease",
                        transform: "translateY(0)",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(13, 110, 253, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <span className="text-white font-medium">
                        Sign Up with Google
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
            <TermsModal
              show={showTermsModal}
              onHide={() => setShowTermsModal(false)}
            />
            <PrivacyModel
              show={showPrivacyModel}
              onHide={() => setShowPrivacyModel(false)}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
