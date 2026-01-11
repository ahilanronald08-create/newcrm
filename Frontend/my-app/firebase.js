// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7rrPolqkKbU2ACX6BVPF38erXlJ6RtMo",
  authDomain: "crm-project-38fa9.firebaseapp.com",
  projectId: "crm-project-38fa9",
  storageBucket: "crm-project-38fa9.firebasestorage.app",
  messagingSenderId: "1000775527336",
  appId: "1:1000775527336:web:99a414724824e7affa0b9d",
  measurementId: "G-2QY09YCVGT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app); 