import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
//import { getenvappid } from './Utils/env';

const firebaseConfig = {
  apiKey: "AIzaSyCfF-PNLJINdBSW-_leJYRGlzZq73mT-_k",
  authDomain: "sortirmapoubelle-b7a5d.firebaseapp.com",
  projectId: "sortirmapoubelle-b7a5d",
  storageBucket: "sortirmapoubelle-b7a5d.appspot.com",
  messagingSenderId: "927215357855",
  appId: "1:927215357855:web:53322cdbdf24ee0bb437aa",
  measurementId: "G-HT0ZEBKTQL"
};

// Initialisez Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialisez le service de messagerie (vérification si le navigateur supporte Firebase Messaging)
let messaging;
if ("serviceWorker" in navigator) {
  try {
    messaging = getMessaging(firebaseApp);
  } catch (err) {
    console.error("Firebase Messaging non pris en charge dans cet environnement :", err);
  }
} else {
  console.warn("Service Workers non pris en charge dans cet environnement.");
}

export { firebaseApp, messaging };