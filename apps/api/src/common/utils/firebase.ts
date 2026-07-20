import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
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
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'credtrust-storage-0156201953',
      });
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      console.log('Initializing Firebase Admin from environment credentials...');
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'credtrust-storage-0156201953',
      });
    } else {
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
      if (!projectId) throw new Error('FIREBASE_PROJECT_ID or GOOGLE_CLOUD_PROJECT is required.');
      console.log('Initializing Firebase Admin with application default credentials...');
      initializeApp({
        credential: applicationDefault(),
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'credtrust-storage-0156201953',
      });
    }
  }
}
