import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";

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
