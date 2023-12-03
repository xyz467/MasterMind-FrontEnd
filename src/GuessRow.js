import React from 'react';

/*
functional React component representing a single guess Row in the game Mastermind. Creates the arrays of
black and white pegs that are visually depicted on the row.
*/
function GuessRow({ guess, blackPegs, whitePegs }) {
/*
 Create arrays of black and white pegs based on the number passed in props
_ is placeholder for a parameter. Being used to fill the current element of the array with undefined.
*/
  const blackPegElements = Array.from({ length: blackPegs }, (_, index) => (
    <span key={index} className="peg black-peg" /> //inline container, groups inline elements
  ));
  const whitePegElements = Array.from({ length: whitePegs }, (_, index) => (
    <span key={index} className="peg white-peg" />
  ));

  return (
      <div className="guess-row">
        <span className="guess">Guess: {guess}</span>
        <div className="pegs-container">
          {blackPegElements}
          {whitePegElements}
        </div>
      </div>
    );
  }

export default GuessRow;