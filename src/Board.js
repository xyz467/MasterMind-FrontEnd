import React, { useState, useEffect } from 'react';
import GuessRow from './GuessRow';
import axios from 'axios';
import { getAuth, signOut } from 'firebase/auth';

function Board({ user }) {
  const [guesses, setGuesses] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameRecords, setGameRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [score, setScore] = useState(100); //perfect score is 100
  const [isUserNameSubmitted, setIsUserNameSubmitted] = useState(false);
  const [deleteScore, setDeleteScore] = useState('');
  const [deleteDate, setDeleteDate] = useState('');
  const [pageCount, setPageCount] = useState('');

  //function to display the top five scoring game records of all users. Pagination on backend to only send back five highest scoring gameRecords
  function displayAllGameRecords() {
    axios.get('https://mastermind-gamerecords.wl.r.appspot.com/findTopScores')
      .then(response => {
        setGameRecords(response.data.content);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }

//function to display all of the current Users game records. It searches by the current userName, and will find all gameRecords with a corresponding googleId
function displayUserGameRecords() {
    const url = `https://mastermind-gamerecords.wl.r.appspot.com/findByUserName/${encodeURIComponent(userName)}`; //path variable is requested, so username is sent in the url

    console.log("Requesting game records for userName:", userName); // Logging the userName
    console.log("URL being used:", url); // Logging the full URL

    axios.get(url)
        .then(response => {
            console.log("Response data:", response.data); // Logging the response data
            setGameRecords(response.data);
            setLoading(false);
        })
        .catch(error => {
            console.error("Error fetching game records:", error); // Logging any error
            setError(error.message);
            setLoading(false);
        });
}

  //returns the four letter secret code, made up of RBYGOP.
  const generateRandomCode = () => {
    const characters = ['R', 'B', 'Y', 'G', 'O', 'P'];
    let code = '';
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };

  const [secretCode, setSecretCode] = useState(generateRandomCode()); //storing the secretCode in secretCode

  //function to get feedback of the guess. 4 letter guess is the parameter. it will return an array of black and white pegs
  //black pegs are for exact matches, white pegs are for partial matches
  const getFeedback = (guess) => {
    let blackPegs = 0;
    let whitePegs = 0;
    let secretArray = [...secretCode];
    let guessArray = [...guess];

    for (let i = 0; i < 4; i++) {
      if (guessArray[i] === secretArray[i]) {
        blackPegs++;
        secretArray[i] = null;
        guessArray[i] = null;
      }
    }

    for (let i = 0; i < 4; i++) {
      if (guessArray[i] && secretArray.includes(guessArray[i])) {
        whitePegs++;
        secretArray[secretArray.indexOf(guessArray[i])] = null;
        guessArray[i] = null;
      }
    }

    return { blackPegs, whitePegs };
  };


  //function to save the user and post the userName and googleID to the userRecord in the backend
  const saveUser = async () => {
    const postData = {
          googleId: user.uid, //firebase uid
          userName,
        };
        // Define Headers
        const headers = {
          'Content-Type': 'application/json'
        };

        console.log("User saved!", postData);

        try {
          const response = await axios.post('https://mastermind-gamerecords.wl.r.appspot.com/saveUser', postData);
          console.log('Response:', response.data);
          displayAllGameRecords();
        } catch (error) {
            console.error('Error posting data:', error);
        }
  }

  //ensures the userName being submit is not empty, then runs saveUser() to save a new userRecord.
  const handleUserNameSubmit = () => {
    if (userName.trim() !== "") {
      setIsUserNameSubmitted(true);
      console.log("User Name Set:", userName);
      saveUser();
    }
  };

  //function will run when user wants to change userName, it will change the userName to empty, and reset the game.
  const handleChangeUserName = () => {
    setIsUserNameSubmitted(false);
    setUserName("");
    resetGame();
  };

  //this function is called to reset the game to the initial parameters to play a new game
  const resetGame = () => {
    setGuesses([]);
    setFeedback([]);
    setCurrentGuess('');
    setSecretCode(generateRandomCode());
    setGameWon(false);
    setScore(100); // Reset the score
  };

  //this function ensures that the user's guess is 4 characters, and makes the guess case insensitive.
  //it checks if the user's guess was correct and sets the feedback of exact and partial matches from the user's guess
  const handleGuessSubmit = (event) => {
    event.preventDefault();
    if (currentGuess.length === 4) {
      const uppercaseGuess = currentGuess.toUpperCase();
      if (uppercaseGuess === secretCode) {
        setGameWon(true);
      }
      const feedbackForGuess = getFeedback(uppercaseGuess);
      setGuesses(prevGuesses => [...prevGuesses, uppercaseGuess]);
      setFeedback(prevFeedback => [...prevFeedback, feedbackForGuess]);
      setCurrentGuess('');
      setScore(prevScore => prevScore - 1); // Update the score
    } else {
      alert('Please enter a guess with exactly 4 letters.');
    }
  };

  //this function saves the game into the backend as a GameRecord, saving score, date, googleId
  const saveGame = async () => {

    const currentDate = new Date();
    //('YYYY-MM-DD')
    const formattedDate = currentDate.toISOString().split('T')[0];

    const postData = {
      score,
      date: formattedDate,
      googleId: user.uid, //firebase uid
    };
    // Define Headers
    const headers = {
      'Content-Type': 'application/json'
    };

    console.log("Game saved!", postData);

    try {
      const response = await axios.post('https://mastermind-gamerecords.wl.r.appspot.com/saveGame', postData);
      console.log('Response:', response.data);
      displayAllGameRecords();
    } catch (error) {
        console.error('Error posting data:', error);
    }
  };

  //this function handles how to delete a score. it will delete the first score in the database that matches the
  //score, date, and googleId that the user submitted. User will only have to input score and date.
  const handleDeleteScore = async () => {
      try {
          console.log('Response:', deleteDate);
          const response = await axios.delete(`https://mastermind-gamerecords.wl.r.appspot.com/deleteGameRecord`, {
              params: { score: deleteScore, date: deleteDate, googleId: user.uid }
          });
          console.log('Delete response:', response.data);
          // Refresh the scores list after deletion
          displayAllGameRecords();
      } catch (error) {
          console.error('Error deleting score:', error);
      }
  };


  //this function handles logging out of the app and firebase. it will send the user back to Login.js
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log('Sign-out successful.');
      window.location.href = '/';
    }).catch((error) => {
      console.error('Sign-out error:', error);
    });
  };

  //if a game is won, which is determined in handleGuessSubmit, then it will ask the user if the user wants to save the game
  //if yes, the game will be saved as a gameRecord. Then the game will be reset and the user can play again.
  useEffect(() => {
    if (gameWon) {
      const saveGameChoice = window.confirm("Congratulations! You won! Do you want to save your game?");
      if (saveGameChoice){
        saveGame();
      }
      resetGame();
    }
    displayAllGameRecords();
  }, [gameWon]); //dependency(a change in gameWon will render the useEffect)

  return (
    <div>
      <h1>Mastermind Game</h1>
      <div className="top-scores-container">
        <div className="top-scores">
          {gameRecords.map(gameRecord => (
            <div className="score-item" key={gameRecord.id}>

              <p><h4>Score: {gameRecord.score}</h4></p>
              <p>Date: {gameRecord.date}</p>
            </div>
          ))}
        </div>

        {/*Buttons to display which scores the user wants to see */}
        <button onClick={displayAllGameRecords}>Display Top 5 Scores</button>
        <button onClick={displayUserGameRecords}>Display My Scores</button>

        {/*Input to delete a score */}
        <div>
            <input
                type="text"
                value={deleteScore}
                onChange={(e) => setDeleteScore(e.target.value)}
                placeholder="Enter score to delete"
            />
            <input
                type="date"
                value={deleteDate}
                onChange={(e) => setDeleteDate(e.target.value)}
                placeholder="Enter date of score"
            />
            <button onClick={handleDeleteScore}>Delete Score</button>
        </div>
      </div>

      {/* User Name Input and Submit Button - Shown only if username not submitted */}
      {!isUserNameSubmitted && (
        <div>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name to play"
          />
          <button onClick={handleUserNameSubmit}>Set User Name</button>
        </div>
      )}

      {/* Conditional rendering: only show the guessing functionality if userName is not empty */}
      {isUserNameSubmitted && (
        <>
          <h2>Welcome, {userName}!</h2>
          <button onClick={handleChangeUserName}>Change Username (Will reset Game)</button>
          <form onSubmit={handleGuessSubmit}>
            <input
              className="guess-input"
              value={currentGuess}
              onChange={e => setCurrentGuess(e.target.value.toUpperCase())}
              placeholder="Enter your guess (e.g., RBYGOP)"
            />
            <button type="submit">Submit Guess</button>
            <button onClick={resetGame} type="button">Reset Game</button>
          </form>
          <div>
            <h2>Current Score: {score}</h2>
          </div>
          <button onClick={handleLogout}>Logout</button>
          <div>
            {guesses.map((guess, index) => (
              <GuessRow
                key={index}
                guess={guess}
                blackPegs={feedback[index].blackPegs}
                whitePegs={feedback[index].whitePegs}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Board;
