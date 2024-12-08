import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider,GithubAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAHEqxNoG8w4Uasgk6Vfx-aeiVBEMoneeQ",
  authDomain: "pwd-final-project.firebaseapp.com",
  projectId: "pwd-final-project",
  storageBucket: "pwd-final-project.firebasestorage.app",
  messagingSenderId: "548388444140",
  appId: "1:548388444140:web:644924f1c198416d0352c9",
  measurementId: "G-92R1CL598K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {auth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup};