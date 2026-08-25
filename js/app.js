document.addEventListener('DOMContentLoaded', () => {
  const viewSections = document.querySelectorAll('.view-section');
  const sidebar = document.getElementById('sidebar');
  const activityList = document.getElementById('activity-list');
  const activeToolsCount = document.getElementById('active-tools-count');
  const statusModulesCount = document.getElementById('status-modules-count');
  const cmdOverlay = document.getElementById('cmd-palette-overlay');
  const cmdInput = document.getElementById('cmd-input');
  const cmdResults = document.getElementById('cmd-results');
  const totalViews = viewSections.length;

  const validViewIds = new Set();
  viewSections.forEach(s => validViewIds.add(s.id));

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

    if (sidebar) sidebar.classList.remove('open');
  };

  const topLevelNavItems = document.querySelectorAll('.top-nav > ul > .nav-item[data-target]');
  topLevelNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      switchView(item.dataset.target);
    });
  });

  const dropdownNavItems = document.querySelectorAll('.top-nav .dropdown-menu .nav-item');
  dropdownNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const target = item.dataset.target;
      if (target) {
        switchView(target);
      }
    });
  });

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  window.App = {
    switchView,
    updateDashboard: () => {
      if (!activityList) return;
      const logs = Utils.Storage.get('c137_activity') || [];

      activityList.innerHTML = logs.length === 0
        ? '<div class="activity-item text-muted">No reality distortions detected yet.</div>'
        : '';

      logs.slice(0, 10).forEach(log => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        const timeSpan = document.createElement('span');
        timeSpan.className = 'time';
        timeSpan.textContent = log.time;
        div.append(timeSpan, ` ${log.action}`);
        activityList.appendChild(div);
      });

      if (activeToolsCount) activeToolsCount.textContent = totalViews;
      if (statusModulesCount) statusModulesCount.textContent = totalViews;
    }
  };

  document.addEventListener('activityLogUpdated', window.App.updateDashboard);

  const searchableTools = [
    { name: 'Main Console & Terminal', target: 'view-dashboard' },
    { name: 'Password Checker', target: 'view-password' },
    { name: 'Password Generator', target: 'view-generator' },
    { name: 'Hash Generator', target: 'view-hash' },
    { name: 'Base64 Encoder/Decoder', target: 'view-encoding' },
    { name: 'File Identifier', target: 'view-magic' },
    { name: 'Phishing Simulator', target: 'view-phishing' },
    { name: 'Network Tools (IP)', target: 'view-ip' },
    { name: 'Port Scanner', target: 'view-scanner' },
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

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
    if (e.key === 'Escape' && cmdOverlay && cmdOverlay.classList.contains('active')) {
      closeCommandPalette();
    }
  });

  window.App.updateDashboard();
});

const initPortalParticles = () => {
  const canvas = document.getElementById('portal-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  const particles = [];
  const PI2 = Math.PI * 2;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  window.addEventListener('resize', resize);
  resize();

  const centerX = width / 2;
  const centerY = height / 2;

  for(let i=0; i<150; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      angle: Math.random() * PI2,
      radius: Math.random() * Math.max(width, height),
      speed: Math.random() * 0.02 + 0.005,
      opacity: Math.random() * 0.5 + 0.1
    });
  }

  const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;

  const animate = () => {
    ctx.fillStyle = 'rgba(26, 32, 44, 0.1)'; 
    ctx.fillRect(0, 0, width, height);

    const cX = width / 2;
    const cY = height / 2;

    particles.forEach(p => {
      if (!isReduced) {
        p.angle += p.speed;
        p.radius -= 0.5;
        if (p.radius < 0) {
          p.radius = Math.max(width, height) / 1.2;
          p.angle = Math.random() * PI2;
        }
        p.x = cX + Math.cos(p.angle) * p.radius;
        p.y = cY + Math.sin(p.angle) * p.radius;
      }

      ctx.fillStyle = `rgba(0, 255, 135, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, PI2);
      ctx.fill();
    });

    if (!isReduced) requestAnimationFrame(animate);
  };

  canvas.style.display = 'block';
  animate();
};

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
  initPortalParticles();
  initSessionTimer();
  initBattery();
  initToggles();
});
