import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;
let adminStorage: Storage;

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const sdkJson = process.env.FIREBASE_ADMIN_SDK_JSON;

  if (sdkJson) {
    const serviceAccount = JSON.parse(sdkJson);
    return initializeApp({ credential: cert(serviceAccount) });
  }

  // En Firebase App Hosting usa Application Default Credentials automáticamente
  return initializeApp();
}

adminApp     = getAdminApp();
adminAuth    = getAuth(adminApp);
adminDb      = getFirestore(adminApp);
adminStorage = getStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage };
