// LoginForm.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './Firebase';
import './LoginForm.css'; // Import the CSS styles

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isNewUser) {
      // Sign Up new users
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log('User registered:', userCredential.user);
        })
        .catch((error) => {
          console.error('Error during registration:', error);
          setError(error.message);
        });
    } else {
      // Sign In existing users
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log('User signed in:', userCredential.user);
        })
        .catch((error) => {
          console.error('Error during sign-in:', error);
          setError(error.message);
        });
    }
  };

  return (
    <div className="login-form-container">
      <h2 className="form-title">{isNewUser ? 'Sign Up' : 'Sign In'}</h2>
      {error && <p className="error-message">{error}</p>}
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="input-field"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="submit-button">
          {isNewUser ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <button className="toggle-button" onClick={() => setIsNewUser(!isNewUser)}>
        {isNewUser ? 'Already have an account? Sign In' : 'New user? Sign Up'}
      </button>
    </div>
  );
};

export default LoginForm;
