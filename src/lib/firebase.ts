import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

/**
 * Active Firebase project for the web app.
 *
 * The API key and the project id MUST belong to the same Firebase project.
 * A mismatch (e.g. a legacy api key combined with the current project id)
 * makes Firebase Auth and the Installations service answer with
 * "403 PERMISSION_DENIED: The caller does not have permission".
 *
 * Because the API key is a public value that identifies its project, we keep
 * the known keys here and always use the key that belongs to the resolved
 * project id, instead of trusting a possibly stale environment variable.
 */
const KNOWN_FIREBASE_PROJECTS: Record<
  string,
  {
    apiKey: string;
    authDomain: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  }
> = {
  "credtrust-8e924": {
    apiKey: "AIzaSyD6C14EwtHf3_s5xIEGgJSqn8bGmF_DslU",
    authDomain: "credtrust-8e924.firebaseapp.com",
    storageBucket: "credtrust-8e924.firebasestorage.app",
    messagingSenderId: "938606850165",
    appId: "1:938606850165:web:08d29f9bb8224ef766083c",
    measurementId: "G-HCZLWX4RGE",
  },
};

const ACTIVE_PROJECT_ID = "credtrust-8e924";

/** Values that belong to a previous/legacy Firebase project. */
const isStale = (value: string | undefined) =>
  !value ||
  value.includes("176626350005") ||
  value.includes("934de704") ||
  value.includes("0156201953") ||
  value.includes("2cf0ad918e0dfeaecc4bfc");

const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const projectId = !isStale(envProjectId) ? envProjectId! : ACTIVE_PROJECT_ID;

const known = KNOWN_FIREBASE_PROJECTS[projectId] ?? KNOWN_FIREBASE_PROJECTS[ACTIVE_PROJECT_ID];

// Only use an env override when it actually belongs to the resolved project.
const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const envMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID;
const envMeasurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

const firebaseConfig = {
  apiKey: envApiKey === known.apiKey ? envApiKey : known.apiKey,
  authDomain: envAuthDomain === known.authDomain ? envAuthDomain : known.authDomain,
  projectId,
  storageBucket: envStorageBucket === known.storageBucket ? envStorageBucket : known.storageBucket,
  messagingSenderId:
    envMessagingSenderId === known.messagingSenderId ? envMessagingSenderId : known.messagingSenderId,
  appId: envAppId === known.appId ? envAppId : known.appId,
  measurementId: envMeasurementId === known.measurementId ? envMeasurementId : known.measurementId,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        try {
          analytics = getAnalytics(app);
        } catch {
          // Analytics disabled or restricted
        }
      }
    })
    .catch(() => {});
}

export { app, auth, analytics };
