import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyAvlDM_JhC-Q2iGYSNPTmYKU9NoBNwtowI",
  authDomain: "ignite-33d2d.firebaseapp.com",
  projectId: "ignite-33d2d",
  storageBucket: "ignite-33d2d.firebasestorage.app",
  messagingSenderId: "954708739917",
  appId: "1:954708739917:web:3d5c26bf9be8cd6adb1904",
  measurementId: "G-RSW1DLQWSB",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const functions = getFunctions(app)
export default app
