// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBn6O6BQxKvwZMtc4kSLrptZqz84wzXj3E",
  authDomain: "iy-mart-hrm.firebaseapp.com",
  projectId: "iy-mart-hrm",
  storageBucket: "iy-mart-hrm.firebasestorage.app",
  messagingSenderId: "782486043412",
  appId: "1:782486043412:web:c38924f9e018e362496001",
  measurementId: "G-FXM8QZHV0V"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
