document.addEventListener('DOMContentLoaded', () => {
  const genLength = document.getElementById('gen-length');
  const genLengthVal = document.getElementById('gen-length-val');
  const genUppercase = document.getElementById('gen-uppercase');
  const genLowercase = document.getElementById('gen-lowercase');
  const genNumbers = document.getElementById('gen-numbers');
  const genSymbols = document.getElementById('gen-symbols');
  const genOutput = document.getElementById('gen-output');
  const btnGenerate = document.getElementById('btn-generate');
  const btnCopyGen = document.getElementById('btn-copy-gen');

  if (!btnGenerate) return;

  const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  genLength.addEventListener('input', e => {
    genLengthVal.textContent = e.target.value;
  });

  const generatePassword = () => {
    let availableChars = '';
    if (genUppercase.checked) availableChars += charSets.uppercase;
    if (genLowercase.checked) availableChars += charSets.lowercase;
    if (genNumbers.checked) availableChars += charSets.numbers;
    if (genSymbols.checked) availableChars += charSets.symbols;

    if (!availableChars) {
      if (window.Utils) Utils.showToast('Select at least one character type.', 'error');
      return;
    }

    const length = parseInt(genLength.value, 10) || 16;
    let password = '';

    if (window.crypto && window.crypto.getRandomValues) {
      const randomValues = new Uint32Array(length);
      window.crypto.getRandomValues(randomValues);
      for (let i = 0; i < length; i++) {
        password += availableChars[randomValues[i] % availableChars.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        password += availableChars[Math.floor(Math.random() * availableChars.length)];
      }
    }

    genOutput.value = password;
    if (window.Utils) Utils.logActivity('Generated new password');
  };

  btnGenerate.addEventListener('click', generatePassword);
  
  btnCopyGen.addEventListener('click', () => {
    if (genOutput.value && window.Utils) {
      Utils.copyToClipboard(genOutput.value);
    }
  });

  generatePassword();
});
