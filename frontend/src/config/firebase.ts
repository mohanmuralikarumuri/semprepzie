import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore  } from "firebase/firestore";

// Firebase configuration - CORRECTED VALUES
const firebaseConfig = {
  apiKey: "AIzaSyBPi_Sl2qELAvamN8s7II-dfw3MGqCujlg",
  authDomain: "semprepzie-315b1.firebaseapp.com",
  projectId: "semprepzie-315b1",
  storageBucket: "semprepzie-315b1.firebasestorage.app",
  messagingSenderId: "247116610802",
  appId: "1:247116610802:web:149f4ee8e5c83c0567a46b",
  measurementId: "G-Q9Y7ZBCV4V"
};

console.log("Firebase initialized with API key:", firebaseConfig.apiKey.substring(0, 15) + "...");

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
