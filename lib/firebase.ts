import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import type { Analytics } from 'firebase/analytics';

// Firebase configuration - hardcoded (không cần .env)
const firebaseConfig = {
  apiKey: 'AIzaSyB0He7TaVue6mKx1HpDA2vMSy48Br7Q9GQ',
  authDomain: 'rasoatcutru.firebaseapp.com',
  projectId: 'rasoatcutru',
  storageBucket: 'rasoatcutru.firebasestorage.app',
  messagingSenderId: '783582653501',
  appId: '1:783582653501:web:7177db013a1fd392a48e54',
  measurementId: 'G-PL5616GJJK',
};

export const app: FirebaseApp = (() => {
  if (getApps().length) return getApp();
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

