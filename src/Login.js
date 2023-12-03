import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
//import firebase from './firebase';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6L0WHhpchifkpYx634yIguK1u_bPg0lc",
  authDomain: "mastermind-3d3c8.firebaseapp.com",
  projectId: "mastermind-3d3c8",
  storageBucket: "mastermind-3d3c8.appspot.com",
  messagingSenderId: "320203030576",
  appId: "1:320203030576:web:0c84adcf5d448d79e22df5",
  measurementId: "G-59XWW4WSVG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); //instance of the firebase app
const auth = getAuth(app); //authentication instance used to manage user authentication

function LoginApp() {
  const [userId, setUserId] = useState('');

  // Effect to process the redirect result
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const user = result.user;
          setUserId(user.uid); //uid is data member in user object from firebase
          console.log("User is signed in:", user);
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error", error);
      });
  }, []);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  return (
    <div>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      {userId && <p>User ID: {userId}</p>}
    </div>
  );
}

export default LoginApp;