import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Paste your Firebase project config here

// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDD-9foESv2IJX-nBN120ybqtZkKZzO2tQ",
  authDomain: "oh-hell-scoring.firebaseapp.com",
  databaseURL: "https://oh-hell-scoring-default-rtdb.firebaseio.com",
  projectId: "oh-hell-scoring",
  storageBucket: "oh-hell-scoring.firebasestorage.app",
  messagingSenderId: "615247979890",
  appId: "1:615247979890:web:3803d26aeb4cb501bda9eb"
};

export const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
