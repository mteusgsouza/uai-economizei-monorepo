// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkX-hQlVrr4oSa4dJ7K6GAznCvUaFzfz4",
  authDomain: "uai-economizei.firebaseapp.com",
  databaseURL: "https://uai-economizei.firebaseio.com",
  projectId: "uai-economizei",
  storageBucket: "uai-economizei.appspot.com",
  messagingSenderId: "696522133411",
  appId: "1:696522133411:web:d049258b39358e5c6f1416",
  measurementId: "G-JNG7DJR7TZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);