// src/utils/employeeCodeGenerator.js
export default function generateEmployeeCode(userName) {
    function hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    }
  
    function to8DigitCode(num) {
      const code = ('00000000' + (num % 100000000)).slice(-8);
      return code;
    }
  
    const numericHash = hashString(userName);
    const employeeCode = to8DigitCode(numericHash);
  
    return employeeCode;
  }