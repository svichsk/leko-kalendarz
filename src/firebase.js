import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TUTAJ WKLEJ SWÓJ SKOPIOWANY OBIEKT Z FIREBASE:
const firebaseConfig = {
  apiKey: "AIzaSyBYyCI8dKyGHdmesNRNsGYBrDV3DFZY-w0",
  authDomain: "lekalendarz.firebaseapp.com",
  projectId: "lekalendarz",
  storageBucket: "lekalendarz.firebasestorage.app",
  messagingSenderId: "389940425030",
  appId: "1:389940425030:web:f63c9722384e9dd778b547"
};


// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Eksportujemy autoryzację i dostawcę logowania Google, żeby użyć ich w App.jsx
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();