document.addEventListener('DOMContentLoaded', () => {
  const pwdInput = document.getElementById('chk-password-input');
  const progressBar = document.getElementById('chk-progress');
  const strengthText = document.getElementById('chk-strength-text');
  
  if (!pwdInput || !progressBar || !strengthText) return;

  const calculateStrength = (password) => {
    if (!password) return 0;
    let score = 0;

    if (password.length > 8) score++;
    if (password.length > 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) score--;

    return Math.max(0, Math.min(score, 6));
  };

  const updateUI = (score, hasInput) => {
    if (!hasInput) {
      progressBar.style.width = '0%';
      progressBar.style.backgroundColor = 'var(--bg-input)';
      strengthText.textContent = 'WAITING FOR INPUT';
      strengthText.style.color = 'var(--text-muted)';
      return;
    }

    const configs = [
      { w: '20%', c: 'var(--error)', t: 'VERY WEAK' },
      { w: '20%', c: 'var(--error)', t: 'VERY WEAK' },
      { w: '40%', c: 'var(--warning)', t: 'WEAK' },
      { w: '40%', c: 'var(--warning)', t: 'WEAK' },
      { w: '60%', c: 'yellow', t: 'FAIR' },
      { w: '80%', c: 'var(--success)', t: 'STRONG' },
      { w: '100%', c: 'var(--accent-cyan)', t: 'VERY STRONG' }
    ];

    const config = configs[score] || configs[0];
    progressBar.style.width = config.w;
    progressBar.style.backgroundColor = config.c;
    strengthText.textContent = config.t;
    strengthText.style.color = config.c;
  };

  pwdInput.addEventListener('input', (e) => {
    const val = e.target.value;
    updateUI(calculateStrength(val), val.length > 0);
  });
});
