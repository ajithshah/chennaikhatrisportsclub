import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { usersDb } from "../lib/db";

export const signInWithGoogle = async (onSuccess, onError, setIsLoading) => {
  try {
    if (setIsLoading) setIsLoading(true);

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (user) {
      // Check if user exists in MongoDB
      const existingUser = await usersDb.get(user.uid);

      const userData = {
        uid: user.uid,
        email: user.email,
        providerId: user.providerData[0].providerId,
        lastLogin: new Date().toISOString(),
      };

      // Create or update the user document
      await usersDb.set(user.uid, userData);

      // If this is a new user, set additional default fields
      if (!existingUser) {
        userData.isAdmin = false;
        userData.createdAt = new Date().toISOString();
        userData.displayName = user.displayName || "";
        userData.photoURL = user.photoURL || "";
        await usersDb.set(user.uid, userData);
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
