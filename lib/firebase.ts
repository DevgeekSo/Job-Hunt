// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD8PKcETZ5bb325ZrTTFAX7_vVYEj82Kf8",
    authDomain: "jobportal-17bca.firebaseapp.com",
    projectId: "jobportal-17bca",
    storageBucket: "jobportal-17bca.firebasestorage.app",
    messagingSenderId: "796590467090",
    appId: "1:796590467090:web:6c3e2ef21e59a282c690cb",
    measurementId: "G-C5KVBFX1RN"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported: boolean) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, db, storage, analytics };
