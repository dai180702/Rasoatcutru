import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import type { Analytics } from 'firebase/analytics';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

// Firebase configuration - lấy từ `.env.local`
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function assertFirebaseEnv(cfg: FirebaseConfig) {
  const required: Array<[string, string]> = [
    ['NEXT_PUBLIC_FIREBASE_API_KEY', cfg.apiKey],
    ['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', cfg.authDomain],
    ['NEXT_PUBLIC_FIREBASE_PROJECT_ID', cfg.projectId],
    ['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', cfg.storageBucket],
    ['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', cfg.messagingSenderId],
    ['NEXT_PUBLIC_FIREBASE_APP_ID', cfg.appId],
  ];

  const missing = required.filter(([, v]) => !v).map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase env vars: ${missing.join(', ')}. Create .env.local in project root.`
    );
  }
}

export const app: FirebaseApp = (() => {
  if (getApps().length) return getApp();
  assertFirebaseEnv(firebaseConfig);
  return initializeApp(firebaseConfig);
})();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

let analyticsSingleton: Analytics | null = null;

/**
 * Analytics chỉ chạy phía client. Call trong component client (useEffect).
 */
export async function getClientAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  if (analyticsSingleton) return analyticsSingleton;

  const { getAnalytics, isSupported } = await import('firebase/analytics');
  if (!(await isSupported())) return null;

  analyticsSingleton = getAnalytics(app);
  return analyticsSingleton;
}

export default app;

