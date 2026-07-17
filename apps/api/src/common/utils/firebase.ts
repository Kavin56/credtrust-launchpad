import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import * as fs from 'fs';
import * as path from 'path';

export function initializeFirebaseAdmin() {
  if (!getApps().length) {
    const keyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(keyPath)) {
      console.log('Initializing Firebase Admin from serviceAccountKey.json...');
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
      });
    } else {
      console.log('Initializing Firebase Admin from env variables...');
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Firebase admin credentials are missing.');
      }

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      });
    }
  }
}
