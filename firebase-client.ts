/// <reference types="vite/types/importMeta.d.ts" />

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

function makeApp() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }

  return initializeApp({
    projectId: import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID,
    apiKey: import.meta.env.VITE_PUBLIC_FIREBASE_API_KEY!,
    authDomain: import.meta.env.VITE_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_PUBLIC_FIREBASE_DATABASE_URL,
    messagingSenderId: import.meta.env.VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_PUBLIC_FIREBASE_APP_ID,
    storageBucket: import.meta.env.VITE_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const app = makeApp();
export const auth = getAuth(app);
