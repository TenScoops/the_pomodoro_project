// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdEFrknNR3_cb_K65RaYonHjXIIlz6Ppw",
  authDomain: "the-progress-pomodoro.firebaseapp.com",
  projectId: "the-progress-pomodoro",
  storageBucket: "the-progress-pomodoro.appspot.com",
  messagingSenderId: "548374405580",
  appId: "1:548374405580:web:db4dc78766cecada1cbd69",
  measurementId: "G-WDDER1584S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const dataBase = getFirestore(app);
