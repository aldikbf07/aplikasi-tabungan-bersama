// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, set, push, remove, update } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChs00RtvQrVM_skrVrzW9t5FCOFBOyR9E",
  authDomain: "savings-app-a6cf0.firebaseapp.com",
  databaseURL: "https://savings-app-a6cf0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "savings-app-a6cf0",
  storageBucket: "savings-app-a6cf0.firebasestorage.app",
  messagingSenderId: "510493395456",
  appId: "1:510493395456:web:2841cb9d15605c41a766e5",
  measurementId: "G-FFEFX2Z4RJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { database, ref, onValue, set, push, remove, update };
