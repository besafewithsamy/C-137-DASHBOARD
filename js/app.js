document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const viewSections = document.querySelectorAll('.view-section');
  const sidebar = document.getElementById('sidebar');
  const activityList = document.getElementById('activity-list');
  const activeToolsCount = document.getElementById('active-tools-count');
  const statusModulesCount = document.getElementById('status-modules-count');
  const scoreEl = document.getElementById('security-score');
  const cmdOverlay = document.getElementById('cmd-palette-overlay');
  const cmdInput = document.getElementById('cmd-input');
  const cmdResults = document.getElementById('cmd-results');
  const totalViews = viewSections.length;

  const switchView = (targetId) => {
    navItems.forEach(item => item.classList.toggle('active', item.dataset.target === targetId));
    viewSections.forEach(section => section.classList.toggle('active', section.id === targetId));
    if (sidebar) sidebar.classList.remove('open');
  };

  navItems.forEach(item => item.addEventListener('click', () => switchView(item.dataset.target)));

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
      
      if (scoreEl) {
        const score = logs.length > 0 ? Math.min(100, 20 + (logs.length * 5)) : 0;
        scoreEl.textContent = score;
        scoreEl.className = score > 80 ? 'text-success' : score > 40 ? 'text-warning' : 'text-error';
      }
    }
  };

  document.addEventListener('activityLogUpdated', window.App.updateDashboard);
  
  const searchableTools = [
    { name: 'Main Console & Terminal', target: 'view-dashboard' },
    { name: 'Password Checker', target: 'view-password' },
    { name: 'Password Generator', target: 'view-generator' },
    { name: 'Hash Generator', target: 'view-hash' },
    { name: 'Base64 Encoder/Decoder', target: 'view-encoding' },
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
  
  for(let i=0; i<40; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1
    });
  }
  
  const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;

  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(p => {
      if (!isReduced) {
        p.x += p.speedX;
        p.y += p.speedY;
        if(p.x < 0) p.x = width;
        if(p.x > width) p.x = 0;
        if(p.y < 0) p.y = height;
        if(p.y > height) p.y = 0;
      }
      
      ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, PI2);
      ctx.fill();
    });
    
    if (!isReduced) requestAnimationFrame(animate);
  };
  
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

document.addEventListener('DOMContentLoaded', () => {
  initPortalParticles();
  initSessionTimer();
});
