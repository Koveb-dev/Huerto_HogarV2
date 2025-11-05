
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5oGPbt9KLa--5l9OIeGisggYV33if2Xg",
  authDomain: "tiendahuertohogar-2ce3a.firebaseapp.com",
  projectId: "tiendahuertohogar-2ce3a",
  storageBucket: "tiendahuertohogar-2ce3a.appspot.com",//actualizar
  messagingSenderId: "857983411223",
  appId: "1:857983411223:web:a1c200cd07b7fd63b36852",
  measurementId: "G-TX342PY82Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);