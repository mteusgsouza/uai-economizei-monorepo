import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBkX-hQlVrr4oSa4dJ7K6GAznCvUaFzfz4",
  authDomain: "uai-economizei.firebaseapp.com",
  projectId: "uai-economizei",
  storageBucket: "uai-economizei.appspot.com",
  messagingSenderId: "696522133411",
  appId: "1:696522133411:web:d049258b39358e5c6f1416",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
