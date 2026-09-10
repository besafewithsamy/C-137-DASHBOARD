document.addEventListener('DOMContentLoaded', () => {
  const btnLegit = document.getElementById('btn-phishing-legit');
  const btnMalicious = document.getElementById('btn-phishing-malicious');
  const btnNext = document.getElementById('btn-phishing-next');
  const feedback = document.getElementById('phishing-feedback');
  
  const pFrom = document.getElementById('phishing-from');
  const pSubject = document.getElementById('phishing-subject');
  const pBody = document.getElementById('phishing-body');
  
  const scenarios = [
    {
      from: 'Support &lt;support@paypal-security.com&gt;',
      subject: 'URGENT: Your account has been suspended',
      body: '<p>Dear Customer,</p><p>We detected unusual activity on your account. To prevent permanent suspension, please verify your identity immediately.</p><p><a href="#" title="http://paypal.login-update.com/auth" style="color: #005ea6; text-decoration: none; font-weight: bold;">Verify Account Now</a></p><p>Thanks,<br>Security Team</p>',
      isPhishing: true,
      explanation: 'Sender domain is spoofed (paypal-security.com). Urgency is a classic tactic. The link points to a suspicious URL (login-update.com).'
    },
    {
      from: 'GitHub &lt;noreply@github.com&gt;',
      subject: '[GitHub] Please verify your device',
      body: '<p>Hey there,</p><p>A new sign-in was detected from a new device.</p><p><a href="#" title="https://github.com/sessions/verify" style="color: #005ea6; text-decoration: none; font-weight: bold;">Review sign-in</a></p><p>If you didn\'t do this, please change your password.</p>',
      isPhishing: false,
      explanation: 'Sender domain is correct. Link points to the legitimate github.com domain. Tone is standard for this alert type.'
    },
    {
      from: 'IT Helpdesk &lt;admin@cmpany-helpdesk.com&gt;',
      subject: 'Mandatory Password Update',
      body: '<p>All employees must update their passwords by COB today.</p><p><a href="#" title="http://192.168.1.100/login" style="color: #005ea6; text-decoration: none; font-weight: bold;">Click here to update</a></p>',
      isPhishing: true,
      explanation: 'Typosquatted domain (cmpany instead of company). Uses an IP address instead of a domain name in the link. Extreme urgency.'
    }
  ];

  let currentScenario = 0;

  const loadScenario = (index) => {
    const s = scenarios[index];
    pFrom.innerHTML = s.from;
    pSubject.textContent = s.subject;
    pBody.innerHTML = s.body;
    feedback.style.display = 'none';
    btnLegit.style.display = 'inline-flex';
    btnMalicious.style.display = 'inline-flex';
    btnNext.style.display = 'none';
  };

  const handleGuess = (guessIsPhishing) => {
    const s = scenarios[currentScenario];
    const isCorrect = guessIsPhishing === s.isPhishing;
    
    feedback.style.display = 'block';
    feedback.innerHTML = `<p style="color: ${isCorrect ? 'var(--accent-green)' : 'var(--error)'}; font-weight: bold; margin-top: 0; margin-bottom: 0.5rem;">${isCorrect ? 'CORRECT' : 'INCORRECT'}</p><p style="margin: 0;">${s.explanation}</p>`;
    
    btnLegit.style.display = 'none';
    btnMalicious.style.display = 'none';
    btnNext.style.display = 'block';
    
    if (window.Utils && window.Utils.logActivity) {
      Utils.logActivity(`Phishing Sim: Scored ${isCorrect ? 'Correct' : 'Incorrect'}`);
    }
  };

  if (btnLegit) {
    btnLegit.addEventListener('click', () => handleGuess(false));
    btnMalicious.addEventListener('click', () => handleGuess(true));
    btnNext.addEventListener('click', () => {
      currentScenario = (currentScenario + 1) % scenarios.length;
      loadScenario(currentScenario);
    });
    
    if (scenarios.length > 0) {
      loadScenario(0);
    }
  }

  const btnAnalyze = document.getElementById('btn-phishing-analyze');
  const analyzerInput = document.getElementById('phishing-analyzer-input');
  const analysisResults = document.getElementById('phishing-analysis-results');
  const findingsList = document.getElementById('phishing-findings-list');

  if (btnAnalyze) {
    btnAnalyze.addEventListener('click', () => {
      const text = analyzerInput.value.toLowerCase();
      findingsList.innerHTML = '';
      let issues = 0;

      const rules = [
        { regex: /urgent|immediate|suspension|verify|password|mandatory/, msg: 'Urgency / Action-oriented keywords detected.' },
        { regex: /http:\/\/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/, msg: 'Suspicious IP address link found instead of domain.' },
        { regex: /bit\.ly|tinyurl|t\.co/, msg: 'URL shortener detected.' },
        { regex: /dear (customer|user)/, msg: 'Generic greeting used.' },
        { regex: /paypal-security|apple-support|google-login/, msg: 'Potential typosquatted or hyphenated spoof domain.' },
        { regex: /spf=fail|dkim=fail|dmarc=fail/, msg: 'Authentication failure in headers.' }
      ];

      rules.forEach(r => {
        if (r.regex.test(text)) {
          issues++;
          const li = document.createElement('li');
          li.innerHTML = `<span style="color: var(--error); font-weight: bold;">[!]</span> <span>${r.msg}</span>`;
          findingsList.appendChild(li);
        }
      });

      const badgeColor = issues === 0 ? 'var(--accent-green)' : (issues < 3 ? 'var(--accent-yellow)' : 'var(--error)');
      const badgeText = issues === 0 ? 'LOW RISK' : (issues < 3 ? 'SUSPICIOUS' : 'CRITICAL PHISHING RISK');
      const badgeLabel = `<span style="background-color: ${badgeColor}; color: var(--bg-dark); padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.9rem;">${badgeText}</span>`;
      
      const headerItem = document.createElement('li');
      headerItem.style.marginBottom = '1rem';
      headerItem.innerHTML = badgeLabel;
      findingsList.insertBefore(headerItem, findingsList.firstChild);

      if (issues === 0) {
        const li = document.createElement('li');
        li.innerHTML = `<span style="color: var(--accent-green); font-weight: bold;">[✓]</span> <span>No obvious static indicators found. Continue manual review.</span>`;
        findingsList.appendChild(li);
      } else {
        const edu = document.createElement('li');
        edu.style.marginTop = '1rem';
        edu.style.padding = '0.5rem';
        edu.style.background = 'rgba(255,255,255,0.05)';
        edu.style.borderLeft = `3px solid ${badgeColor}`;
        edu.innerHTML = `<strong>SAFETY TIP:</strong> Always verify the sender domain independently and do not click suspicious links. Detected ${issues} indicator(s).`;
        findingsList.appendChild(edu);
      }

      analysisResults.style.display = 'block';

      if (window.Utils && window.Utils.logActivity) {
        Utils.logActivity('Phishing Sim: Analyzed headers');
      }
    });
  }
});
