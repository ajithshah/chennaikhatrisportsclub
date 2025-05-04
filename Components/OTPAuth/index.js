import React, { useState, useEffect, useRef } from "react";
import { sendOTP, verifyOTP } from "../../utils/auth";

const OTPAuth = ({ onSuccess, onError, setIsLoading }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(60);
  const [isMobile, setIsMobile] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  // Check if viewport is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create and manage reCAPTCHA container
  useEffect(() => {
    // Create recaptcha-container div if it doesn't exist
    if (!document.getElementById("recaptcha-container")) {
      const recaptchaContainer = document.createElement("div");
      recaptchaContainer.id = "recaptcha-container";
      recaptchaContainer.style.visibility = "hidden";
      recaptchaContainer.style.position = "absolute";
      recaptchaContainer.style.top = "0";
      recaptchaContainer.style.left = "0";
      document.body.appendChild(recaptchaContainer);
    }

    // Cleanup on unmount
    return () => {
      // Don't remove the container on unmount, just reset it
      // This prevents issues with reusing the same reCAPTCHA container
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = "";
      }
      
      // Clear any timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step === 2 && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [step, timer]);

  // Format phone number with country code
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");

    // For Indian numbers, add +91 as default country code
    return cleaned ? `+91${cleaned}` : "";
  };

  const handlePhoneNumberChange = (e) => {
    // Only keep digits and set without country code
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setPhoneNumber(digitsOnly);
    setError("");
  };

  const handleOTPChange = (e) => {
    // Only allow digits and limit to 6 characters
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(value);
    setError("");
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Format phone number with country code
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      console.log("Sending OTP to formatted number:", formattedPhoneNumber);

      // Send OTP using the updated auth utility
      await sendOTP(
        formattedPhoneNumber,
        () => {
          // On successful OTP send
          setStep(2);
          setTimer(60);
          setResendDisabled(true);
        },
        (error) => {
          // On OTP send error
          console.error("OTP Send Error:", error);
          setError(error.message);
        }
      );
    } catch (error) {
      console.error("General Error:", error);
      setError(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      setResendDisabled(true);
      setError("");

      // Format phone number with country code
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

      // Resend OTP
      await sendOTP(
        formattedPhoneNumber,
        () => {
          // On successful OTP resend
          setTimer(60);
        },
        (error) => {
          // On OTP resend error
          console.error("Resend OTP Error:", error);
          setError(error.message);
          setResendDisabled(false);
        }
      );
    } catch (error) {
      console.error("Resend General Error:", error);
      setError(error.message || "Failed to resend OTP. Please try again.");
      setResendDisabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Verify the OTP using the updated auth utility
      await verifyOTP(
        otpCode,
        (result) => {
          // On successful verification
          console.log("OTP verified successfully");
          if (onSuccess) onSuccess(result);
        },
        (error) => {
          // On verification error
          console.error("Verify OTP Error:", error);
          setError(error.message);
          
          // If code expired, go back to phone input step
          if (error.code === "auth/code-expired") {
            setStep(1);
          }
          
          if (onError) onError(error);
        },
        setIsLoading
      );
    } catch (error) {
      console.error("Verify General Error:", error);
      setError(error.message || "Failed to verify OTP. Please try again.");
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="otp-auth-container">
      {step === 1 ? (
        <div className="phone-step-container">
          <h3
            className={`mb-4 ${isMobile ? "text-lg" : "text-xl"} font-semibold`}
          >
            Sign in with your phone number
          </h3>

          <p className="text-gray-600 mb-4">
            We'll send you a one-time password to verify your number
          </p>

          <form onSubmit={handleSendOTP}>
            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <div className="phone-input-container">
                <div className="country-code">+91</div>
                <input
                  type="tel"
                  id="phone"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  className="phone-input"
                  maxLength={10}
                  required
                  autoComplete="tel-national"
                  aria-label="Phone number without country code"
                />
              </div>
              <small className="text-gray-500 block mt-1">
                Enter your 10-digit mobile number
              </small>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="send-otp-btn"
              disabled={phoneNumber.length !== 10}
            >
              <div className="btn-content">
                <span className="btn-text">Send OTP</span>
                <span className="btn-icon">→</span>
              </div>
            </button>
          </form>
        </div>
      ) : (
        <div className="otp-step-container">
          <h3
            className={`mb-4 ${isMobile ? "text-lg" : "text-xl"} font-semibold`}
          >
            Enter verification code
          </h3>

          <p className="text-gray-600 mb-4">
            We've sent a 6-digit code to <strong>+91 {phoneNumber}</strong>
          </p>

          <form onSubmit={handleVerifyOTP}>
            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                6-digit code
              </label>
              <input
                type="text"
                id="otp"
                placeholder="123456"
                value={otpCode}
                onChange={handleOTPChange}
                className="otp-input"
                maxLength={6}
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                aria-label="6-digit verification code"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="verify-otp-btn"
                disabled={otpCode.length !== 6}
              >
                <div className="btn-content">
                  <span className="btn-text">Verify Code</span>
                  <span className="btn-icon">✓</span>
                </div>
              </button>

              <div className="text-center mt-2">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{" "}
                  {resendDisabled ? (
                    <span>Resend in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="resend-btn"
                    >
                      Resend OTP
                    </button>
                  )}
                </p>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="change-number-btn"
                >
                  Change phone number
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        .otp-auth-container {
          width: 100%;
        }

        .phone-input-container {
          display: flex;
          align-items: center;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .country-code {
          background-color: #f3f4f6;
          padding: 0.75rem 1rem;
          font-weight: 500;
          color: #4b5563;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }

        .phone-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          font-size: ${isMobile ? "0.9rem" : "1rem"};
          transition: all 0.3s ease;
        }

        .phone-input:focus {
          outline: none;
        }

        .phone-input-container:focus-within {
          border-color: #0053af;
          box-shadow: 0 0 0 3px rgba(0, 83, 175, 0.1);
        }

        .otp-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          font-size: ${isMobile ? "0.9rem" : "1rem"};
          transition: all 0.3s ease;
          letter-spacing: 0.1em;
        }

        .otp-input:focus {
          outline: none;
          border-color: #0053af;
          box-shadow: 0 0 0 3px rgba(0, 83, 175, 0.1);
        }

        .error-message {
          color: #e53e3e;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background-color: rgba(229, 62, 62, 0.1);
          border-radius: 6px;
        }

        .send-otp-btn,
        .verify-otp-btn {
          background: linear-gradient(to right, #0053af, #007bff);
          color: white;
          border: none;
          text-align: center;
          border-radius: 50px;
          padding: 0;
          font-weight: 600;
          overflow: hidden;
          position: relative;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 83, 175, 0.3);
          width: 100%;
          height: ${isMobile ? "48px" : "54px"};
        }

        .send-otp-btn:disabled,
        .verify-otp-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .send-otp-btn:hover:not(:disabled),
        .verify-otp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 7px 20px rgba(0, 83, 175, 0.4);
        }

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 0 1.5rem;
        }

        .btn-text {
          margin-right: 0.5rem;
          transition: transform 0.3s ease;
          font-size: ${isMobile ? "0.9rem" : "1rem"};
        }

        .btn-icon {
          font-size: ${isMobile ? "1.1rem" : "1.25rem"};
          transition: transform 0.3s ease;
        }

        .send-otp-btn:hover:not(:disabled) .btn-text,
        .verify-otp-btn:hover:not(:disabled) .btn-text {
          transform: translateX(-5px);
        }

        .send-otp-btn:hover:not(:disabled) .btn-icon,
        .verify-otp-btn:hover:not(:disabled) .btn-icon {
          transform: translateX(5px);
        }

        .resend-btn {
          color: #0053af;
          font-weight: 600;
          cursor: pointer;
          background: none;
          border: none;
          transition: all 0.3s ease;
          font-size: ${isMobile ? "0.8rem" : "0.875rem"};
        }

        .resend-btn:hover {
          color: #007bff;
          text-decoration: underline;
        }

        .change-number-btn {
          color: #4a5568;
          cursor: pointer;
          background: none;
          border: none;
          margin-top: 0.5rem;
          font-size: ${isMobile ? "0.8rem" : "0.875rem"};
          transition: all 0.3s ease;
        }

        .change-number-btn:hover {
          color: #2d3748;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default OTPAuth;
