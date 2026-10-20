import {
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import { usersDb } from "../lib/db";

// Creates or updates the MongoDB user document after a Google sign-in.
const syncGoogleUser = async (user) => {
  // Check if user exists in MongoDB
  const existingUser = await usersDb.get(user.uid);

  // New members can be paused by the super admin; existing members always get in.
  if (!existingUser) {
    let signupsOpen = true;
    try {
      const res = await fetch("/api/settings");
      if (res.ok) signupsOpen = (await res.json()).settings.signupsOpen !== false;
    } catch (error) {
      console.error("Could not check sign-up setting:", error);
    }
    if (!signupsOpen) {
      await signOut(auth);
      if (typeof window !== "undefined") {
        window.alert("New member sign-ups are paused right now. Please try again later.");
      }
      throw new Error("SIGNUPS_CLOSED");
    }
  }

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

  return userData;
};

// Signs in with the Google ID token returned by Google One Tap.
export const signInWithGoogleIdToken = async (idToken) => {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  const userData = await syncGoogleUser(result.user);
  return { user: result.user, userData };
};

export const signInWithGoogle = async (onSuccess, onError, setIsLoading) => {
  try {
    if (setIsLoading) setIsLoading(true);

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (user) {
      const userData = await syncGoogleUser(user);

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
    if (typeof window !== "undefined") {
      window.google?.accounts?.id?.disableAutoSelect();
    }

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
