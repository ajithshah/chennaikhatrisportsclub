// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC39c2u2Wx1r1ixxeTHpZfRfCgcjlqX2rY",
  authDomain: "chennaikhatrisportsclub-dc10b.firebaseapp.com",
  projectId: "chennaikhatrisportsclub-dc10b",
  storageBucket: "chennaikhatrisportsclub-dc10b.firebasestorage.app",
  messagingSenderId: "1030404667752",
  appId: "1:1030404667752:web:3fc9bb05feb8ffce1ffedd",
  measurementId: "G-NHV29YQGDH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);