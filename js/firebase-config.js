import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFeyncxLwgO6L1Y68bQ9YFsfjuCK3ewiA",
  authDomain: "react-project-web-186a7.firebaseapp.com",
  projectId: "react-project-web-186a7",
  storageBucket: "react-project-web-186a7.firebasestorage.app",
  messagingSenderId: "554962146410",
  appId: "1:554962146410:web:055398721f6f51e97b6613",
  measurementId: "G-PJQ5B1FQ8Y"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper functions for wishes
export const wishesCollection = collection(db, "wishes");
