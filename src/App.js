import React, { useState, useEffect } from 'react';
import {  onAuthStateChanged, signOut } from "firebase/auth";
import SignaturePad from './SignaturePad'; // Signature Pad Component
import LoginForm from './LoginForm'; // Authentication Component
import { auth } from './Firebase'; // Firebase setup

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if the user is authenticated when the component loads
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log("User signed out");
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  };

  return (
    <div className="App">
      <h1>Signature Authentication</h1>
      {user ? (
        <>
          <p>Welcome, {user.email}!</p>
          <button onClick={handleLogout}>Sign Out</button>
          <SignaturePad />
        </>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}

export default App;
