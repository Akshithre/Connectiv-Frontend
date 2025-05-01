// src/firebase/auth.js
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "firebase/auth";

// Helper function to get the correct URL
const getVerificationUrl = () => {
  // Get the current domain
  const domain = window.location.origin;
  // Construct the verification URL
  return `${domain}/verify-email`;
};

const doCreateUserWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Send verification email with dynamic URL
    await sendEmailVerification(auth.currentUser, {
      url: getVerificationUrl(),
      handleCodeInApp: true
    });
    return userCredential;
  } catch (error) {
    throw error;
  }
};

const doSignInWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      throw new Error("Please verify your email before signing in.");
    }
    return userCredential;
  } catch (error) {
    throw error;
  }
};

const doSendEmailVerification = () => {
  if (auth.currentUser) {
    return sendEmailVerification(auth.currentUser, {
      url: getVerificationUrl(),
      handleCodeInApp: true
    });
  }
  throw new Error("No user is currently signed in.");
};

const doSignOut = () => {
  return signOut(auth);
};

export {
  doCreateUserWithEmailAndPassword,
  doSignInWithEmailAndPassword,
  doSendEmailVerification,
  doSignOut
};