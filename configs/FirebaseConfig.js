// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApo3-2FMUSh1zoh2H0yAz_FimjAWbVZ-Q",
  authDomain: "cibaro-c1908.firebaseapp.com",
  projectId: "cibaro-c1908",
  storageBucket: "cibaro-c1908.firebasestorage.app",
  messagingSenderId: "949591318326",
  appId: "1:949591318326:web:cf9ad8e4534b8333575d97",
  measurementId: "G-HYHC6BND3B"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);