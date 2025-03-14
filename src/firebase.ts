import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyApyPeisRyjytge0S9bVUTOXf7H417Yb24",
    authDomain: "imdb-frontend-1808.firebaseapp.com",
    projectId: "imdb-frontend-1808",
    storageBucket: "imdb-frontend-1808.firebasestorage.app",
    messagingSenderId: "309051848028",
    appId: "1:309051848028:web:4ebb588987bafd24403d99",
    measurementId: "G-YPHQJTDY27"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
// Define the type for the user
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
}
