document.addEventListener('DOMContentLoaded', () => {
  const genLength = document.getElementById('gen-length');
  const genLengthVal = document.getElementById('gen-length-val');
  const genUppercase = document.getElementById('gen-uppercase');
  const genLowercase = document.getElementById('gen-lowercase');
  const genNumbers = document.getElementById('gen-numbers');
  const genSymbols = document.getElementById('gen-symbols');
  const genOutput = document.getElementById('gen-output');
  const genEntropy = document.getElementById('gen-entropy');
  const btnGenerate = document.getElementById('btn-generate');
  const btnCopyGen = document.getElementById('btn-copy-gen');

  if (!btnGenerate) return;

  const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  const selectedSets = () => {
    const active = [];
    if (genUppercase.checked) active.push(charSets.uppercase);
    if (genLowercase.checked) active.push(charSets.lowercase);
    if (genNumbers.checked) active.push(charSets.numbers);
    if (genSymbols.checked) active.push(charSets.symbols);
    return active;
  };

  const randomInt = (maxExclusive) => {
    if (window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return buf[0] % maxExclusive;
    }
    return Math.floor(Math.random() * maxExclusive);
  };

  const secureShuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generatePassword = () => {
    const sets = selectedSets();

    if (sets.length === 0) {
      if (window.Utils) Utils.showToast('Select at least one character type.', 'error');
      return;
    }

    const length = parseInt(genLength.value, 10) || 16;
    const availableChars = sets.join('');
    const chars = [];

    // Guarantee at least one char from each selected set
    sets.forEach(set => chars.push(set[randomInt(set.length)]));

    while (chars.length < length) {
      chars.push(availableChars[randomInt(availableChars.length)]);
    }

    secureShuffle(chars);
    const password = chars.join('');

    genOutput.value = password;

    if (genEntropy) {
      const bits = Math.round(length * Math.log2(availableChars.length) * 10) / 10;
      genEntropy.textContent = `${bits} bits`;
    }

    if (window.Utils) Utils.logActivity('Generated new password');
  };

  genLength.addEventListener('input', e => {
    genLengthVal.textContent = e.target.value;
  });

  [genUppercase, genLowercase, genNumbers, genSymbols].forEach(cb => {
    if (cb) cb.addEventListener('change', generatePassword);
  });

  btnGenerate.addEventListener('click', generatePassword);

  btnCopyGen.addEventListener('click', () => {
    if (genOutput.value && window.Utils) {
      Utils.copyToClipboard(genOutput.value);
    }
  });
});
