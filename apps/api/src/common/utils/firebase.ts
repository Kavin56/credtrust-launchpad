import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Default GCS bucket used for uploaded documents.
 * NOTE: the GCS bucket project and the Firebase project are different projects.
 */
const DEFAULT_STORAGE_BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.GCS_BUCKET_NAME ||
  'srs-bank-storage-934de704';

export function initializeFirebaseAdmin() {
  if (getApps().length) return;

  const keyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(keyPath)) {
    console.log('Initializing Firebase Admin from serviceAccountKey.json...');
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    try {
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: DEFAULT_STORAGE_BUCKET,
      });
      console.log(`Firebase Admin initialized for project: ${serviceAccount.project_id}`);
      return;
    } catch (err: any) {
      console.warn(`Service account key could not be used (${err?.message}); falling back to ADC.`);
    }
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    console.log('Initializing Firebase Admin from environment credentials...');
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: DEFAULT_STORAGE_BUCKET,
      });
      console.log(`Firebase Admin initialized for project: ${projectId}`);
      return;
    } catch (err: any) {
      console.warn(`Environment service account could not be used (${err?.message}); falling back to ADC.`);
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID or GOOGLE_CLOUD_PROJECT is required.');
  console.log('Initializing Firebase Admin with application default credentials...');
  initializeApp({
    credential: applicationDefault(),
    projectId,
    storageBucket: DEFAULT_STORAGE_BUCKET,
  });
  console.log(`Firebase Admin initialized for project: ${projectId}`);
}
