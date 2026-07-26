import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Fallback config — uses the active Firebase project (gen-lang-client-0156201953)
const fallbackConfig = {
  apiKey: "AIzaSyAHQVHtVofMnQUhoir-1qT5wizEl6XkTt0",
  authDomain: "gen-lang-client-0156201953.firebaseapp.com",
  projectId: "gen-lang-client-0156201953",
  storageBucket: "gen-lang-client-0156201953.firebasestorage.app",
  messagingSenderId: "176626350005",
  appId: "1:176626350005:web:2cf0ad918e0dfeaecc4bfc",
  measurementId: "G-0JYENXPWKF",
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
