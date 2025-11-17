// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1A6TULkT3J3IopAdF-U2A6KI3P3zUMoU",
  authDomain: "edunova-c7333.firebaseapp.com",
  projectId: "edunova-c7333",
  storageBucket: "edunova-c7333.firebasestorage.app",
  messagingSenderId: "785002827947",
  appId: "1:785002827947:web:90de93d4da4f1604f627ee",
  measurementId: "G-HREH1KKC49",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
provider.setCustomParameters({ 'login_hint': 'user@example.com' });
export { auth, provider };
