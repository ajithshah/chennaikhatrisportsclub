// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArUZ5V8YGNq3pPJG92RfjPAJE_9TSf3g8",
  authDomain: "chennaikhatrisportsclub-48e9b.firebaseapp.com",
  projectId: "chennaikhatrisportsclub-48e9b",
  storageBucket: "chennaikhatrisportsclub-48e9b.firebasestorage.app",
  messagingSenderId: "502891899644",
  appId: "1:502891899644:web:1ad1753bbc57e38f340579",
  measurementId: "G-RM6HQXR8DF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Note: Database operations now use MongoDB via lib/db.js
// Firebase Auth is still used for authentication

export { auth }
