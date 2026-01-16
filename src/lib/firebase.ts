import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


const initFirebase = () => {
  if (getApps().length > 0) return { app: getApp(), auth: getAuth(getApp()) };

  if (!firebaseConfig.apiKey) {
    if (typeof window !== 'undefined') {
      console.warn("Firebase API Key is missing. Phone verification will be disabled. Check .env to enable.");
    }

    return { app: null, auth: null };
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  return { app, auth };
}

const { app, auth } = initFirebase();
const googleProvider = new GoogleAuthProvider();

export {
  app,
  auth,
  googleProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
};

