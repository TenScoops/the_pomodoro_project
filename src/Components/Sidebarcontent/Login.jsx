import React from 'react';
import SetterContext from '../SetterContext';
import { useContext, useState } from 'react';
import Modal from "react-modal";
import './CSS/Login.css'
// import { useState } from 'react';

import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css'

const firebaseConfig = {
  apiKey: "AIzaSyBlmz1h-80L5aG4_16PlxRSfo_s4rT1pCo",
  authDomain: "honest-pomodoro.firebaseapp.com",
  projectId: "honest-pomodoro",
  storageBucket: "honest-pomodoro.appspot.com",
  messagingSenderId: "644997715064",
  appId: "1:644997715064:web:62db616e6eaf7ebcd3c98d",
  measurementId: "G-QK0E5L8DZY"
};

const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return true;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none';
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: '/', // add proper success url later
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  // Terms of service url.
  // tosUrl: '<your-tos-url>',
  // Privacy policy url.
  // privacyPolicyUrl: '<your-privacy-policy-url>'
};

const app = firebase.initializeApp(firebaseConfig);
const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());


const Login = () => {
  return (
    ui.start('#firebaseui-auth-container', uiConfig)
  )
}

export default Login