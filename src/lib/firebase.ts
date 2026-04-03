import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Fallback to provided config when env not set
const fallbackConfig = {
  apiKey: "AIzaSyB9G-zJyIg1Ur1KGGsWoeWDDQQhPCI10bI",
  authDomain: "financial-tracker-a9357.firebaseapp.com",
  projectId: "financial-tracker-a9357",
  storageBucket: "financial-tracker-a9357.firebasestorage.app",
  messagingSenderId: "489079524100",
  appId: "1:489079524100:web:d18280d358a070101dde51",
  measurementId: "G-93QNN37Z72",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || fallbackConfig.measurementId,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, auth, analytics };
