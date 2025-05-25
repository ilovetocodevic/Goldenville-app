// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: REPLACE THIS WITH YOUR ACTUAL FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your actual apiKey
  authDomain: "YOUR_AUTH_DOMAIN", // Replace with your actual authDomain
  projectId: "YOUR_PROJECT_ID", // Replace with your actual projectId
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your actual storageBucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your actual messagingSenderId
  appId: "YOUR_APP_ID", // Replace with your actual appId
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional: if you have Analytics
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // if already initialized, use that one
}

const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };
