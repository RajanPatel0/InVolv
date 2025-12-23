import React, { useEffect, useState, useRef } from 'react';

function Otp({ size, onSubmit }) {
  const [inputValues, setInputValues] = useState(() => new Array(size).fill(''));
  const inputRefs = useRef([]);

  const focusNext = (index) => {
    if (index < size - 1) inputRefs.current[index + 1]?.focus();
  };

  const focusPrevious = (index) => {
    if (index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleChange = (e, index) => {
    const { value } = e.target;

    // Allow only single digit
    if (!/^[0-9]?$/.test(value)) return;

    const newValues = [...inputValues];
    newValues[index] = value;
    setInputValues(newValues);

    if (value) focusNext(index);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (inputValues[index]) {
        const newValues = [...inputValues];
        newValues[index] = '';
        setInputValues(newValues);
      } else {
        focusPrevious(index);
        const newValues = [...inputValues];
        newValues[index - 1] = '';
        setInputValues(newValues);
      }
    }

    if (e.key === 'ArrowLeft') {
      focusPrevious(index);
    }

    if (e.key === 'ArrowRight') {
      focusNext(index);
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const isComplete = inputValues.every((val) => val !== '');
    if (isComplete) {
      onSubmit(inputValues);
    }
  }, [inputValues]);

  return (
    <div className="flex justify-center items-center">
      <div className="space-x-4 lg:space-x-5">
        {inputValues.map((inputValue, index) => (
          <input
            key={index}
                type="text"                 // keep type text to maintain UI
             inputMode="numeric"         // ensures numeric keyboard on mobile
                pattern="[0-9]*"            // allows only digits

            id={index.toString()}
            maxLength={1}
            value={inputValue}
            ref={(el) => (inputRefs.current[index] = el)}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="h-8 w-8 border border-[#CCCBCB] rounded-md text-center text-black md:h-10 md:w-10 lg:w-[50px] lg:h-[50px]"
          />
        ))}
      </div>
    </div>
  );
}

export default Otp;
