import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDXZ54C-QYmh_uAzxSofnAtWaEPs4cP7eA",
    authDomain: "auth-sign-870db.firebaseapp.com",
    projectId: "auth-sign-870db",
    storageBucket: "auth-sign-870db.appspot.com",
    messagingSenderId: "208440134301",
    appId: "1:208440134301:web:8d9e1b1c2fb3e0fdfce274",
    measurementId: "G-KB9WNDMVD3"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Firebase authentication
export const storage = getStorage(app); // Firebase storage
