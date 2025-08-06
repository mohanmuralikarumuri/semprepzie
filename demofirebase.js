// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPi_Sl2qELAvamN8s7II-dfw3MGqCujlg",
  authDomain: "semprepzie-315b1.firebaseapp.com",
  projectId: "semprepzie-315b1",
  storageBucket: "semprepzie-315b1.firebasestorage.app",
  messagingSenderId: "247116610802",
  appId: "1:247116610802:web:149f4ee8e5c83c0567a46b",
  measurementId: "G-Q9Y7ZBCV4V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);