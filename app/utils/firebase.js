import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5rhxMT6v_X-8KPS9KyP529VFeK86yPCo",
  authDomain: "recipe-fb419.firebaseapp.com",
  projectId: "recipe-fb419",
  storageBucket: "recipe-fb419.appspot.com",
  messagingSenderId: "1096280593756",
  appId: "1:1096280593756:web:614f522ff2459bd7995d99",
  measurementId: "G-9P6S04HRMR"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth };