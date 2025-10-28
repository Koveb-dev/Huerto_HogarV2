import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBBT7jka7a-7v3vY19BlSajamiedLrBTN0",
    authDomain: "tiendanombretienda.firebaseapp.com",
    projectId: "tiendanombretienda",
    storageBucket: "tiendanombretienda.firebasestorage.app",
    messagingSenderId: "408928911689",
    appId: "1:408928911689:web:d8b313c7e15fc528661a98",
    measurementId: "G-Y1DW47VEWZ"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  