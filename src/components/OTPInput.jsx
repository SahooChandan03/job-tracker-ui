import { useState, useRef, useEffect } from 'react';

const OTPInput = ({ value, onChange, onComplete, error, disabled = false }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value) {
      const otpArray = value.split('').slice(0, 6);
      const newOtp = [...otpArray, ...Array(6 - otpArray.length).fill('')];
      setOtp(newOtp);
    }
  }, [value]);

  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      onComplete?.(otpString);
    }
  }, [otp, onComplete]);

  const handleChange = (index, value) => {
    if (disabled) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    onChange?.(newOtp.join(''));
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;
    
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    if (disabled) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    const pastedArray = pastedData.split('');
    
    const newOtp = [...otp];
    pastedArray.forEach((char, index) => {
      if (index < 6 && /^\d$/.test(char)) {
        newOtp[index] = char;
      }
    });
    
    setOtp(newOtp);
    onChange?.(newOtp.join(''));
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedArray.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`
              w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition-colors
              ${disabled 
                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              ${digit ? 'border-blue-500 bg-blue-50' : ''}
            `}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default OTPInput; 