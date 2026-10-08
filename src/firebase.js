import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// NOWY IMPORT: Moduł bazy danych
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYyCI8dKyGHdmesNRNsGYBrDV3DFZY-w0",
  authDomain: "lekalendarz.firebaseapp.com",
  projectId: "lekalendarz",
  storageBucket: "lekalendarz.firebasestorage.app",
  messagingSenderId: "389940425030",
  appId: "1:389940425030:web:f63c9722384e9dd778b547"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// NOWY EKSPORT: Inicjalizacja bazy danych
export const db = getFirestore(app);