import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";

// Send OTP to phone number
export const sendOTP = async (phoneNumber, onSuccess, onError) => {
  try {
    // Log the phone number for debugging
    console.log("Sending OTP to:", phoneNumber);

    let appVerifier;
    try {
      // Clean up any existing reCAPTCHA widgets
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (recaptchaContainer) {
        // Clear the content of the container
        recaptchaContainer.innerHTML = "";
      }

      // Create a new RecaptchaVerifier instance
      appVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, you can proceed with sending OTP
          console.log("reCAPTCHA verified");
        },
        "expired-callback": () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          console.log("reCAPTCHA expired");
          if (onError) {
            onError({
              code: "auth/captcha-expired",
              message: "Verification captcha expired. Please try again.",
            });
          }
        },
      });

      // Render the reCAPTCHA widget
      appVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
      });

      // Send the verification code to the user's phone
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );

      // Store the confirmation result globally for verification
      window.confirmationResult = confirmationResult;

      // Call success callback
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(confirmationResult);
      }

      return confirmationResult;
    } catch (phoneAuthError) {
      console.error("Phone Auth Error:", phoneAuthError);

      // Reset reCAPTCHA
      if (appVerifier) {
        try {
          appVerifier.clear();
        } catch (clearError) {
          console.log("Error clearing reCAPTCHA", clearError);
        }
      }

      // Create a user-friendly error message based on the error code
      let errorMessage = "Failed to send OTP. Please try again.";

      if (phoneAuthError.code === "auth/invalid-app-credential") {
        errorMessage =
          "Authentication setup issue. Please try again in a few minutes.";
      } else if (phoneAuthError.code === "auth/captcha-check-failed") {
        errorMessage = "Authentication failed. Please try again later.";
      } else if (phoneAuthError.code === "auth/quota-exceeded") {
        errorMessage = "SMS quota exceeded. Please try again later.";
      } else if (phoneAuthError.code === "auth/invalid-phone-number") {
        errorMessage =
          "Invalid phone number format. Please enter a valid number.";
      } else if (phoneAuthError.code === "auth/missing-phone-number") {
        errorMessage = "Please enter your phone number.";
      } else if (phoneAuthError.code === "auth/too-many-requests") {
        errorMessage =
          "Too many OTP requests. For security reasons, please try again later.";
      } else if (phoneAuthError.code === "auth/network-request-failed") {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      }

      if (onError && typeof onError === "function") {
        onError({
          code: phoneAuthError.code,
          message: errorMessage,
        });
      }

      return null;
    }
  } catch (error) {
    console.error("Error sending OTP:", error);

    if (onError && typeof onError === "function") {
      onError({
        code: error.code || "unknown-error",
        message:
          error.message || "An unexpected error occurred. Please try again.",
      });
    }

    return null;
  }
};

// Verify OTP code
export const verifyOTP = async (code, onSuccess, onError, setIsLoading) => {
  try {
    if (setIsLoading) setIsLoading(true);

    if (!window.confirmationResult) {
      throw new Error(
        "No confirmation result available. Please send OTP first."
      );
    }

    // Confirm the verification code
    const result = await window.confirmationResult.confirm(code);
    const user = result.user;

    if (user) {
      // Get existing user data from Firestore if available
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Extract only the number part without the country code
      let phoneNumber = user.phoneNumber;
      if (phoneNumber && phoneNumber.startsWith("+")) {
        // Remove country code (e.g., +91)
        // This will extract just the number part, assuming country code can be 1-3 digits
        const matches = phoneNumber.match(/^\+\d{1,3}(\d+)$/);
        if (matches && matches[1]) {
          phoneNumber = matches[1];
        }
      }

      // Prepare user data for Firestore
      const userData = {
        uid: user.uid,
        phoneNumber: phoneNumber, // Store only the number without country code
        rawPhoneNumber: user.phoneNumber, // Keep the original format with country code as backup
        providerId: "phone",
        lastLogin: new Date().toISOString(),
      };

      // Create or update the user document
      await setDoc(userRef, userData, { merge: true });

      // If this is a new user, set additional default fields
      if (!userSnap.exists()) {
        userData.isAdmin = false;
        userData.createdAt = new Date().toISOString();
        await setDoc(userRef, userData, { merge: true });
      }

      // Clean up the confirmation result
      window.confirmationResult = null;

      // Call the success callback if provided
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess({ user, userData });
      }

      return { user, userData };
    }
    return null;
  } catch (error) {
    console.error("Error verifying OTP:", error);

    // Create a user-friendly error message based on the error code
    let errorMessage = "Failed to verify OTP. Please try again.";

    if (error.code === "auth/invalid-verification-code") {
      errorMessage =
        "Invalid verification code. Please enter the correct code.";
    } else if (error.code === "auth/code-expired") {
      errorMessage =
        "Verification code has expired. Please request a new code.";
    } else if (error.code === "auth/missing-verification-code") {
      errorMessage = "Please enter the verification code.";
    } else if (error.code === "auth/network-request-failed") {
      errorMessage =
        "Network error. Please check your internet connection and try again.";
    }

    // Call the error callback if provided
    if (onError && typeof onError === "function") {
      onError({
        code: error.code || "unknown-error",
        message: errorMessage || error.message,
      });
    }

    return null;
  } finally {
    if (setIsLoading) setIsLoading(false);
  }
};

export const signInWithGoogle = async (onSuccess, onError, setIsLoading) => {
  try {
    if (setIsLoading) setIsLoading(true);

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const userData = {
        uid: user.uid,
        email: user.email,
        providerId: user.providerData[0].providerId,
        lastLogin: new Date().toISOString(),
      };

      // Create or update the user document
      await setDoc(userRef, userData, { merge: true });

      // If this is a new user, set additional default fields
      if (!userSnap.exists()) {
        userData.isAdmin = false;
        userData.createdAt = new Date().toISOString();
        userData.displayName = userSnap.displayName || "";
        userData.photoURL = userSnap.photoURL || "";
        await setDoc(userRef, userData, { merge: true });
      }

      // Call the success callback if provided
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess({ user, userData });
      }

      return { user, userData };
    }
    return null;
  } catch (error) {
    console.error("Error signing in with Google:", error);

    // Call the error callback if provided
    if (onError && typeof onError === "function") {
      onError(error);
    }

    return null;
  } finally {
    if (setIsLoading) setIsLoading(false);
  }
};

/**
 * Sign out the current user
 * @param {Function} onSuccess - Optional callback function to execute after successful sign-out
 * @param {Function} onError - Optional callback function to handle errors
 * @returns {Promise<boolean>} - True if sign-out successful, false otherwise
 */
export const handleSignOut = async (onSuccess, onError) => {
  try {
    await signOut(auth);

    // Call the success callback if provided
    if (onSuccess && typeof onSuccess === "function") {
      onSuccess();
    }

    return true;
  } catch (error) {
    console.error("Error signing out:", error);

    // Call the error callback if provided
    if (onError && typeof onError === "function") {
      onError(error);
    }

    return false;
  }
};
