import React, { useRef, useState } from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, query, orderBy, limit, addDoc,
} from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/compat';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MESSUREMENT_ID,
};
const app = initializeApp(firebaseConfig);

const auth = getAuth();
const firestore = getFirestore(app);

const App = () => {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <div><span style={{ fontSize: 'larger' }}>💬</span> by KP</div>
        <SignOut/>
      </header>

      <section>
        {user ? <ChatRoom/> : <SignIn/>}
      </section>
    </div>
  );
};

export default App;

const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then();
  };
  return (
    <button onClick={signInWithGoogle}>Sign In with Google</button>
  );
};

const SignOut = () => {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  );
};

const ChatRoom = () => {
  const messageRef = collection(firestore, 'messages');
  const q = query(messageRef, orderBy('createdAt'), limit(25));
  const [messages] = useCollectionData(q);
  const [formValue, setFormValue] = useState('');
  const dummy = useRef();
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    const dataToAdd = {
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    };
    setFormValue('');
    await addDoc(messageRef, dataToAdd);
  };
  return (
    <>
      <div>
        {messages && messages.map((msg) =>
          <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy} />
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit" disabled={!formValue}>👉</button>
      </form>
    </>
  );
};

const ChatMessage = (props) => {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return <div className={`message ${messageClass}`}>
    <img src={photoURL} alt=""/>
    <p>{text}</p>
  </div>;
};
