import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB7wsFCU1pcbWblFgihHZSKOmbgGIQvU8E",
    authDomain: "inventorysystem-dcaea.firebaseapp.com",
    projectId: "inventorysystem-dcaea",
    storageBucket: "inventorysystem-dcaea.firebasestorage.app",
    messagingSenderId: "565955958883",
    appId: "1:565955958883:web:a69050bda6fceb6b6e0056",
    measurementId: "G-JXB713YPKZ"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get a Firestore instance
export const db = firebase.firestore();
