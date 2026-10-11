import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Fallback config — uses the active Firebase project (credtrust-8e924)
const fallbackConfig = {
  apiKey: "AIzaSyD6C14EwtHf3_s5xIEGgJSqn8bGmF_DslU",
  authDomain: "credtrust-8e924.firebaseapp.com",
  projectId: "credtrust-8e924",
  storageBucket: "credtrust-8e924.firebasestorage.app",
  messagingSenderId: "938606850165",
  appId: "1:938606850165:web:08d29f9bb8224ef766083c",
  measurementId: "G-HCZLWX4RGE",
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
