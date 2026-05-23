import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2CyPHNziQlavyCzttDY3D96TmhkYHoaQ",
  authDomain: "cdois-vias.firebaseapp.com",
  projectId: "cdois-vias",
  storageBucket: "cdois-vias.firebasestorage.app",
  messagingSenderId: "47732769068",
  appId: "1:47732769068:web:ea62c1b3572fe18285ec89"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const diagRef = collection(db, "diagrama");
export const oacRef = collection(db, "oacs");
