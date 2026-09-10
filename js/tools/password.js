document.addEventListener('DOMContentLoaded', () => {
  const pwdInput = document.getElementById('chk-password-input');
  const progressBar = document.getElementById('chk-progress');
  const strengthText = document.getElementById('chk-strength-text');
  const detailsDiv = document.getElementById('chk-details');
  const entropyEl = document.getElementById('chk-entropy');
  const crackTimeEl = document.getElementById('chk-crack-time');
  const warningsEl = document.getElementById('chk-warnings');
  const btnToggle = document.getElementById('btn-chk-toggle');

  if (!pwdInput || !progressBar || !strengthText) return;

  const COMMON_PASSWORDS = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'letmein',
    'monkey', 'dragon', 'master', 'admin', 'welcome', 'login',
    'iloveyou', 'sunshine', 'princess', 'football', 'baseball',
    'superman', 'trustno1', 'passw0rd', 'p@ssword', 'qwerty123',
    'zaq12wsx', 'starwars', 'summer', 'winter', 'whatever'
  ];

  const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890'];
  const SEQUENCES = ['abcdefghijklmnopqrstuvwxyz', '0123456789'];

  const CHARSET_SIZES = [
    { regex: /[a-z]/, size: 26 },
    { regex: /[A-Z]/, size: 26 },
    { regex: /[0-9]/, size: 10 },
    { regex: /[^A-Za-z0-9]/, size: 33 }
  ];

  const detectPatterns = (pwd) => {
    const warnings = [];
    const lower = pwd.toLowerCase();

    if (COMMON_PASSWORDS.some(c => lower === c)) {
      warnings.push('This is one of the most commonly used passwords.');
    } else if (COMMON_PASSWORDS.some(c => lower.includes(c) && c.length >= 6)) {
      warnings.push('Contains a common dictionary password.');
    }

    const hasSequence = SEQUENCES.some(seq => {
      const rev = [...seq].reverse().join('');
      for (let i = 0; i + 4 <= seq.length; i++) {
        const chunk = seq.slice(i, i + 4);
        if (lower.includes(chunk)) return true;
        if (lower.includes([...chunk].reverse().join(''))) return true;
      }
      return rev.length === 0;
    });
    if (hasSequence) warnings.push('Contains a character sequence (e.g. abcd, 1234).');

    const hasKeyboardRun = KEYBOARD_ROWS.some(row => {
      for (let i = 0; i + 4 <= row.length; i++) {
        if (lower.includes(row.slice(i, i + 4))) return true;
      }
      return false;
    });
    if (hasKeyboardRun) warnings.push('Contains a keyboard pattern (e.g. qwerty, asdf).');

    const repeatMatch = pwd.match(/(.)\1{2,}/);
    if (repeatMatch) warnings.push(`Contains a repeated character ("${repeatMatch[1]}").`);

    const yearMatch = pwd.match(/(19|20)\d{2}/);
    if (yearMatch) warnings.push('Contains a year (often guessable).');

    if (pwd.toLowerCase() === pwd && /[a-z]/.test(pwd) && pwd.length > 0) {
      warnings.push('No uppercase or mixed case.');
    }

    return warnings;
  };

  const calcEntropyBits = (pwd) => {
    let poolSize = 0;
    CHARSET_SIZES.forEach(cs => { if (cs.regex.test(pwd)) poolSize += cs.size; });
    if (poolSize === 0) return 0;
    return Math.round(pwd.length * Math.log2(poolSize) * 10) / 10;
  };

  const formatCrackTime = (seconds) => {
    if (seconds < 1) return 'Instantly';
    const units = [
      ['year', 31557600], ['day', 86400], ['hour', 3600],
      ['minute', 60], ['second', 1]
    ];
    for (const [name, size] of units) {
      const val = seconds / size;
      if (val >= 1) {
        const formatted = val >= 1000 ? val.toExponential(2) : Math.round(val).toString();
        return `${formatted} ${name}${Math.round(val) !== 1 ? 's' : ''}`;
      }
    }
    return 'Instantly';
  };

  const estimateCrackTime = (entropyBits) => {
    // 10 billion guesses/sec (modern GPU cluster) * 2^entropy / 2 (average case)
    const guessesPerSecond = 1e10;
    const avgSeconds = Math.pow(2, entropyBits - 1) / guessesPerSecond;
    return formatCrackTime(avgSeconds);
  };

  const scoreFromEntropy = (bits, warningCount) => {
    let score = 0;
    if (bits >= 28) score = 1;
    if (bits >= 36) score = 2;
    if (bits >= 60) score = 3;
    if (bits >= 80) score = 4;
    if (bits >= 100) score = 5;
    if (bits >= 120) score = 6;
    if (warningCount >= 2) score = Math.max(0, score - 2);
    else if (warningCount === 1) score = Math.max(0, score - 1);
    return score;
  };

  const updateUI = () => {
    const val = pwdInput.value;

    if (!val) {
      progressBar.style.width = '0%';
      strengthText.textContent = 'WAITING FOR INPUT';
      strengthText.style.color = 'var(--text-muted)';
      detailsDiv.style.display = 'none';
      return;
    }

    const warnings = detectPatterns(val);
    const bits = calcEntropyBits(val);
    const score = scoreFromEntropy(bits, warnings.length);

    const configs = [
      { w: '20%', c: 'var(--error)', t: 'VERY WEAK' },
      { w: '20%', c: 'var(--error)', t: 'VERY WEAK' },
      { w: '40%', c: 'var(--warning)', t: 'WEAK' },
      { w: '60%', c: 'var(--accent-yellow)', t: 'FAIR' },
      { w: '75%', c: 'var(--success)', t: 'STRONG' },
      { w: '90%', c: 'var(--accent-green)', t: 'STRONG' },
      { w: '100%', c: 'var(--accent-cyan)', t: 'VERY STRONG' }
    ];

    const config = configs[score] || configs[0];
    progressBar.style.width = config.w;
    progressBar.style.backgroundColor = config.c;
    strengthText.textContent = config.t;
    strengthText.style.color = config.c;

    detailsDiv.style.display = 'block';
    entropyEl.textContent = `${bits} bits`;
    crackTimeEl.textContent = estimateCrackTime(bits);

    warningsEl.innerHTML = '';
    warnings.forEach(w => {
      const div = document.createElement('div');
      div.textContent = `\u26a0 ${w}`;
      warningsEl.appendChild(div);
    });
  };

  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      const isHidden = pwdInput.type === 'password';
      pwdInput.type = isHidden ? 'text' : 'password';
      btnToggle.textContent = isHidden ? '🙈' : '👁';
      btnToggle.title = isHidden ? 'Hide password' : 'Show password';
      btnToggle.setAttribute('aria-label', btnToggle.title);
      pwdInput.focus();
    });
  }

  pwdInput.addEventListener('input', updateUI);
});
