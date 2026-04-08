import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtZOV1-01QgcfCEztTmvPFwTMQfmFA810",
  authDomain: "nexus-eeda4.firebaseapp.com",
  projectId: "nexus-eeda4",
  storageBucket: "nexus-eeda4.firebasestorage.app",
  messagingSenderId: "867441875176",
  appId: "1:867441875176:web:78e79fadd270125e82d15d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
