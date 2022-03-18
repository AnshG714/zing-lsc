import firebaseConfig from './firebase.json'
import {
  getAuth,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { initializeApp } from 'firebase/app'

initializeApp(firebaseConfig)
export const auth = getAuth()

// function attempting to sign in with Google
export async function signInSSO() {
  const provider = new GoogleAuthProvider()
  const userCredential = await signInWithPopup(auth, provider)
}

export async function logOut() {
  signOut(auth)
}
