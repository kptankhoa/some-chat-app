import React, { useRef, useState } from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, query, orderBy, limit, addDoc,
} from 'firebase/firestore';
import {
  getAuth, signInWithPopup, GoogleAuthProvider,
} from 'firebase/auth';
import 'firebase/analytics';

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
        <h1>💬 by KP</h1>
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
    <button className="sign-in" onClick={signInWithGoogle}>
      Sign In with Google
    </button>
  );
};

const SignOut = () => {
  const signOut = () => auth.signOut();
  return auth.currentUser && (
    <button className="sign-out" onClick={signOut}>
      Sign Out
    </button>
  );
};

const ChatRoom = () => {
  const [limitIndex, setLimitIndex] = useState(1);
  const messageRef = collection(firestore, 'messages');
  const q = query(
    messageRef,
    orderBy('createdAt', 'desc'),
    limit(15 * limitIndex),
  );
  const [messages] = useCollectionData(q);
  const [formValue, setFormValue] = useState('');
  const dummy = useRef(null);
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    const dataToAdd = {
      text: !!formValue ? formValue : '🔥',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    };
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
    await addDoc(messageRef, dataToAdd);
  };
  const orderedMessages = messages?.slice(0).reverse();
  return (
    <>
      <main>
        <button
          className="load-more-btn"
          onClick={() => setLimitIndex(limitIndex + 1)}
        >
          Load more...
        </button>
        {messages && orderedMessages.map((msg) =>
          <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy} />
      </main>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={formValue}
          placeholder='say something bro'
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">
          {!!formValue ? '👉' : '🔥'}
        </button>
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
