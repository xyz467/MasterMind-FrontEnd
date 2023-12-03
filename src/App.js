import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './App.css';
import Board from './Board';
import Login from './Login';


//starting point of Project. Checks to make sure a firebaseUser is logged in before playing. If no user is logged in
//then the user will be sent to the Login page
function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => { //listener to observe changes in auth state
     //listener returns function stored in unsubscribe. will remove listener when called.
      if (firebaseUser) {
        // User is signed in, set the user in the state
        setUser(firebaseUser);
      } else {
        // User is signed out, set the user in the state to null
        setUser(null);
      }
    });

    // Cleanup subscription on App unmount
    return () => unsubscribe(); //removing listener
  }, [auth]);


    return (
      <div>
        {user ? <Board user={user} /> : <Login />} {/*if user is true, call books component. else call login */}
      </div>
    );
  }

export default App;