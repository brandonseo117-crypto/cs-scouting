// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC7uerZ6ZUR4xv0NTZHIoXTulXSEidz6AE",
    authDomain: "cs-scouting.firebaseapp.com",
    projectId: "cs-scouting",
    storageBucket: "cs-scouting.firebasestorage.app",
    messagingSenderId: "912015511152",
    appId: "1:912015511152:web:ed880a38178bf49fcaaeb5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)