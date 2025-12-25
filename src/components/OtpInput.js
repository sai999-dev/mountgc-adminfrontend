import React, { useRef, useState, useEffect } from 'react';

/**
 * OTP Input Component - 6 separate input boxes with auto-focus
 * @param {Function} onChange - Callback when OTP is complete (receives 6-digit string)
 * @param {boolean} disabled - Disable input
 * @param {boolean} error - Show error state
 */
const OtpInput = ({ onChange, disabled = false, error = false }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-submit when OTP is complete
    if (otp.every(digit => digit !== '')) {
      onChange(otp.join(''));
    }
  }, [otp, onChange]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Focus previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();

    // Only accept 6-digit numbers
    if (/^\d{6}$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus(); // Focus last input
    }
  };

  const handleFocus = (index) => {
    // Select all text on focus
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all
            ${error
              ? 'border-red-500 bg-red-50'
              : digit
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 bg-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          `}
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default OtpInput;
