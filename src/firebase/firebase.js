// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATdP0K3g7CCruiq5TLWLip6A8t1Nsl-DI",
  authDomain: "hubridge-d2d05.firebaseapp.com",
  projectId: "hubridge-d2d05",
  storageBucket: "hubridge-d2d05.appspot.com",
  messagingSenderId: "158212099448",
  appId: "1:158212099448:web:a9870f9157112e9f4d0c8d",
  measurementId: "G-7J58XDJWF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth };