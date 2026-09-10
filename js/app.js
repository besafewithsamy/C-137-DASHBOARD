document.addEventListener('DOMContentLoaded', () => {
  const viewSections = document.querySelectorAll('.view-section');
  const activityList = document.getElementById('activity-list');
  const activeToolsCount = document.getElementById('active-tools-count');
  const statusModulesCount = document.getElementById('status-modules-count');
  const cmdOverlay = document.getElementById('cmd-palette-overlay');
  const cmdInput = document.getElementById('cmd-input');
  const cmdResults = document.getElementById('cmd-results');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const topNav = document.querySelector('.top-nav');

  const validViewIds = new Set();
  viewSections.forEach(s => validViewIds.add(s.id));

  const closeAllDropdowns = () => {
    document.querySelectorAll('.top-nav .has-dropdown').forEach(p => {
      p.classList.remove('open');
      const trigger = p.querySelector('span[role="button"]');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  };

  const switchView = (targetId) => {
    if (!targetId || !validViewIds.has(targetId)) {
      targetId = 'view-dashboard';
    }

    viewSections.forEach(section => section.classList.toggle('active', section.id === targetId));

    const allNavItems = document.querySelectorAll('.top-nav .nav-item');
    allNavItems.forEach(item => item.classList.remove('active'));

    const dropdownParents = document.querySelectorAll('.top-nav .has-dropdown');
    dropdownParents.forEach(p => p.classList.remove('active'));

    const matched = document.querySelector(`.top-nav .nav-item[data-target="${targetId}"]`);
    if (matched) {
      matched.classList.add('active');
      const parentDropdown = matched.closest('.has-dropdown');
      if (parentDropdown) {
        parentDropdown.classList.add('active');
      }
    }

    if (mobileMenuBtn) {
      topNav.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
    closeAllDropdowns();

    if (targetId === 'view-terminal') {
      const termInput = document.getElementById('terminal-input');
      if (termInput) termInput.focus();
    }

    history.replaceState(null, '', `#${targetId.replace('view-', '')}`);

    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.scrollTop = 0;
  };

  document.querySelectorAll('.top-nav .nav-item[data-target]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      switchView(item.dataset.target);
    });
  });

  document.querySelectorAll('.top-nav .has-dropdown > span').forEach(trigger => {
    const toggleDropdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const parent = trigger.closest('.has-dropdown');
      const isOpen = parent.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        parent.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    };

    trigger.addEventListener('click', toggleDropdown);
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        toggleDropdown(e);
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) closeAllDropdowns();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns();
  });

  if (mobileMenuBtn && topNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = topNav.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  window.App = {
    switchView,
    updateDashboard: () => {
      if (!activityList) return;
      const logs = Utils.Storage.get('c137_activity') || [];

      activityList.innerHTML = '';

      const logCount = document.getElementById('log-count');
      if (logCount) logCount.textContent = `${logs.length} ${logs.length === 1 ? 'entry' : 'entries'}`;

      if (logs.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'activity-item text-muted';
        empty.textContent = 'No reality distortions detected yet.';
        activityList.appendChild(empty);
      }

      logs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        const timeSpan = document.createElement('span');
        timeSpan.className = 'time';
        timeSpan.textContent = log.time;
        div.append(timeSpan, ` ${log.action}`);
        activityList.appendChild(div);
      });

      const usedTools = new Set(
        logs.map(log => (log.action || '').split(':')[0]).filter(Boolean)
      ).size;

      if (activeToolsCount) activeToolsCount.textContent = usedTools;
      if (statusModulesCount) statusModulesCount.textContent = usedTools;
    }
  };

  const btnClearLogs = document.getElementById('btn-clear-logs');
  if (btnClearLogs) {
    btnClearLogs.addEventListener('click', () => {
      Utils.Storage.set('c137_activity', []);
      document.dispatchEvent(new Event('activityLogUpdated'));
      if (window.Utils) Utils.showToast('Activity log cleared.', 'success');
    });
  }

  document.addEventListener('activityLogUpdated', window.App.updateDashboard);

  const searchableTools = [
    { name: 'Main Console', target: 'view-dashboard' },
    { name: 'Password Checker', target: 'view-password' },
    { name: 'Password Generator', target: 'view-generator' },
    { name: 'Hash Generator', target: 'view-hash' },
    { name: 'Base64 Encoder/Decoder', target: 'view-encoding' },
    { name: 'File Identifier', target: 'view-magic' },
    { name: 'Phishing Simulator', target: 'view-phishing' },
    { name: 'IP Lookup', target: 'view-ip' },
    { name: 'Port Scanner', target: 'view-scanner' },
    { name: 'Terminal', target: 'view-terminal' },
    { name: 'Activity Logs', target: 'view-logs' },
    { name: 'Diagnostics', target: 'view-about' }
  ];

  let selectedIndex = 0;
  let currentResultItems = [];

  const renderCmdResults = (query) => {
    const q = query.toLowerCase();
    const filtered = searchableTools.filter(tool => tool.name.toLowerCase().includes(q));

    cmdResults.innerHTML = '';
    selectedIndex = 0;
    currentResultItems = [];

    if (filtered.length === 0) {
      cmdResults.innerHTML = '<div class="cmd-result-item text-muted">No modules found.</div>';
      return;
    }

    filtered.forEach((tool, index) => {
      const div = document.createElement('div');
      div.className = `cmd-result-item ${index === 0 ? 'selected' : ''}`;
      div.textContent = tool.name;
      div.dataset.target = tool.target;

      div.addEventListener('click', () => {
        window.App.switchView(tool.target);
        closeCommandPalette();
      });

      cmdResults.appendChild(div);
      currentResultItems.push(div);
    });
  };

  const openCommandPalette = () => {
    if (!cmdOverlay) return;
    cmdOverlay.classList.add('active');
    cmdInput.value = '';
    renderCmdResults('');
    cmdInput.focus();
  };

  const closeCommandPalette = () => {
    if (cmdOverlay) cmdOverlay.classList.remove('active');
  };

  if (cmdInput) {
    cmdInput.addEventListener('input', e => renderCmdResults(e.target.value));

    cmdInput.addEventListener('keydown', e => {
      if (currentResultItems.length === 0) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        currentResultItems[selectedIndex].classList.remove('selected');
        selectedIndex = e.key === 'ArrowDown'
          ? (selectedIndex + 1) % currentResultItems.length
          : (selectedIndex - 1 + currentResultItems.length) % currentResultItems.length;
        currentResultItems[selectedIndex].classList.add('selected');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        window.App.switchView(currentResultItems[selectedIndex].dataset.target);
        closeCommandPalette();
      }
    });
  }

  if (cmdOverlay) {
    cmdOverlay.addEventListener('click', e => {
      if (e.target === cmdOverlay) closeCommandPalette();
    });
  }

  const cmdHint = document.getElementById('cmd-hint');
  if (cmdHint) {
    cmdHint.addEventListener('click', openCommandPalette);
  }

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
    if (e.key === 'Escape' && cmdOverlay && cmdOverlay.classList.contains('active')) {
      closeCommandPalette();
    }
  });

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && validViewIds.has(`view-${initialHash}`)) {
    switchView(`view-${initialHash}`);
  }

  window.App.updateDashboard();
});

const initSessionTimer = () => {
  const sessionEl = document.getElementById('session-uptime');
  if (!sessionEl) return;

  let seconds = 0;
  setInterval(() => {
    seconds++;
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    sessionEl.textContent = `${h}:${m}:${s}`;
  }, 1000);
};

const initBattery = () => {
  const batteryLevel = document.getElementById('battery-level');
  if (!batteryLevel) return;
  
  setInterval(() => {
    const min = 75;
    const max = 98;
    const val = Math.floor(Math.random() * (max - min + 1)) + min;
    batteryLevel.style.width = `${val}%`;
    
    if (val < 80) batteryLevel.style.background = 'var(--accent-yellow)';
    else batteryLevel.style.background = 'var(--accent-green)';
    batteryLevel.style.boxShadow = `0 0 8px ${batteryLevel.style.background}`;
  }, 3000);
};

const initToggles = () => {
  const holoBtn = document.getElementById('btn-holo-toggle');
  const audioBtn = document.getElementById('btn-audio-toggle');
  
  if (holoBtn) {
    holoBtn.addEventListener('click', () => {
      document.body.classList.toggle('scanlines');
      if (window.AudioEngine) window.AudioEngine.play('bleep');
    });
  }
  
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (window.AudioEngine) {
        const isMuted = window.AudioEngine.toggleMute();
        audioBtn.textContent = isMuted ? '🔇' : '🔊';
        audioBtn.title = isMuted ? 'Unmute Audio' : 'Mute Audio';
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initSessionTimer();
  initBattery();
  initToggles();
});
