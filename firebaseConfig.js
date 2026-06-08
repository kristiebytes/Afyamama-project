// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdkxqgxqInhIG-L0v7H_LJeqjAEap4B1s",
  authDomain: "afyamama-5cbaf.firebaseapp.com",
  projectId: "afyamama-5cbaf",
  storageBucket: "afyamama-5cbaf.firebasestorage.app",
  messagingSenderId: "973201830551",
  appId: "1:973201830551:web:04db5011ab139f4d16efd2",
  measurementId: "G-K6321ZYT7N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);