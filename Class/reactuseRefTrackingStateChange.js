import { useRef, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [inputValue, setInputValue] = useState("");
  const previousInputValue = useRef("");

  useEffect(() => {
    previousInputValue.current = inputValue;
  }, [inputValue]);

  return (
    <>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <h2>Current Value: {inputValue}</h2>
      <h2>Previous Value: {previousInputValue.current}</h2>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <App />
);


/*This time we use a combination of useState, useEffect, and useRef 
to keep track of the previous state.

In the useEffect, we are updating the useRef current value each 
time the inputValue is updated by entering text into the input field. */

import React from 'react'

const reactuseRefTrackingStateChange = () => {
    const [inputValue1, setInputValue1] = useState("");
    const previousInputValue1 = useRef("")

    useEffect(()=>{
        previousInputValue1.current = inputValue1


    }, [inputValue1])

  return (
    <div>reactuseRefTrackingStateChange</div>
  )
}

export default reactuseRefTrackingStateChange