document.addEventListener('DOMContentLoaded', () => {
  let threatChart = null;

  const initChart = () => {
    const ctx = document.getElementById('threat-activity-chart');
    if (!ctx) return;
    
    if (!window.Chart) {
      setTimeout(initChart, 100);
      return;
    }

    const data = {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
      datasets: [
        {
          label: 'Threat Activity',
          data: [10, 50, 20, 90, 40, 60, 30],
          borderColor: '#00F0FF',
          backgroundColor: 'rgba(0, 240, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Bandwidth (MB/s)',
          data: [5, 15, 10, 25, 20, 15, 30],
          borderColor: '#FF3366',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    };

    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#8892B0', font: { family: 'monospace' } }
          },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { ticks: { color: '#8892B0', font: { family: 'monospace' } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#8892B0', font: { family: 'monospace' } }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    };

    threatChart = new window.Chart(ctx, config);
  };

  initChart();

  const timeFilters = document.querySelectorAll('#chart-time-filters button');
  timeFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      timeFilters.forEach(b => b.classList.remove('btn-primary'));
      e.target.classList.add('btn-primary');
      
      if (!threatChart) return;
      const range = e.target.dataset.range;
      let newThreat = [];
      let newBandwidth = [];
      let newLabels = [];
      
      if (range === '1H') {
        newLabels = ['-60m', '-50m', '-40m', '-30m', '-20m', '-10m', 'Now'];
        newThreat = [12, 19, 3, 5, 2, 3, 10];
        newBandwidth = [1, 2, 1, 1, 3, 2, 5];
      } else if (range === '24H') {
        newLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'];
        newThreat = [10, 50, 20, 90, 40, 60, 30];
        newBandwidth = [5, 15, 10, 25, 20, 15, 30];
      } else if (range === '7D') {
        newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        newThreat = [100, 200, 150, 300, 250, 400, 350];
        newBandwidth = [50, 60, 40, 80, 70, 90, 100];
      } else if (range === '30D') {
        newLabels = ['W1', 'W2', 'W3', 'W4'];
        newThreat = [1000, 800, 1200, 950];
        newBandwidth = [400, 350, 500, 450];
      }
      
      threatChart.data.labels = newLabels;
      threatChart.data.datasets[0].data = newThreat;
      threatChart.data.datasets[1].data = newBandwidth;
      threatChart.update();
    });
  });

  const updateDynamicScore = () => {
    const scoreEl = document.getElementById('security-score');
    if (!scoreEl) return;
    
    let baseScore = 75;
    const logs = window.Utils && window.Utils.Storage ? window.Utils.Storage.get('c137_activity') || [] : [];
    
    const threatHits = logs.filter(l => l.action && l.action.toLowerCase().includes('phishing')).length;
    baseScore -= threatHits * 2;
    
    const activeTools = document.getElementById('active-tools-count');
    if (activeTools) {
      baseScore += parseInt(activeTools.textContent || '0') * 1.5;
    }
    
    baseScore = Math.max(0, Math.min(100, Math.round(baseScore)));
    
    scoreEl.textContent = baseScore;
    
    const svgCircle = scoreEl.closest('.card').querySelector('circle:nth-child(2)');
    if (svgCircle) {
      const offset = 283 - (283 * baseScore) / 100;
      svgCircle.style.strokeDashoffset = offset;
      
      if (baseScore > 80) svgCircle.setAttribute('stroke', 'var(--accent-green)');
      else if (baseScore > 50) svgCircle.setAttribute('stroke', 'var(--accent-yellow)');
      else svgCircle.setAttribute('stroke', 'var(--error)');
    }
  };

  document.addEventListener('activityLogUpdated', updateDynamicScore);
  setInterval(updateDynamicScore, 5000);
  setTimeout(updateDynamicScore, 1000);

  const telemetryOutput = document.getElementById('telemetry-output');
  const filterCheckboxes = document.querySelectorAll('#telemetry-filters input');
  
  const getActiveLevels = () => {
    return Array.from(filterCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  };

  const addTelemetryLog = () => {
    if (!telemetryOutput) return;
    
    const levels = ['INFO', 'WARN', 'CRITICAL'];
    const selectedLevel = levels[Math.floor(Math.random() * levels.length)];
    
    const activeLevels = getActiveLevels();
    if (!activeLevels.includes(selectedLevel)) {
      setTimeout(addTelemetryLog, Math.random() * 2000 + 1000);
      return;
    }
    
    const msgs = {
      INFO: ['Subsystem nominal.', 'Heartbeat received.', 'Routine scan complete.', 'Port 443 active.', 'User authenticated.'],
      WARN: ['High latency detected.', 'Unrecognized packet dropped.', 'Bandwidth spike.', 'Failed login attempt.'],
      CRITICAL: ['Intrusion attempt blocked!', 'Firewall rule violated.', 'DDoS signature matched.', 'Memory threshold exceeded!']
    };
    
    const msg = msgs[selectedLevel][Math.floor(Math.random() * msgs[selectedLevel].length)];
    const time = new Date().toISOString().split('T')[1].slice(0, 8);
    
    let color = 'var(--text-main)';
    if (selectedLevel === 'WARN') color = 'var(--accent-yellow)';
    if (selectedLevel === 'CRITICAL') color = 'var(--error)';
    
    const div = document.createElement('div');
    div.style.marginBottom = '4px';
    div.innerHTML = \`<span style="color: var(--text-muted);">[\${time}]</span> <strong style="color: \${color};">[\${selectedLevel}]</strong> \${msg}\`;
    
    telemetryOutput.appendChild(div);
    if (telemetryOutput.childNodes.length > 20) {
      telemetryOutput.removeChild(telemetryOutput.firstChild);
    }
    telemetryOutput.scrollTop = telemetryOutput.scrollHeight;
    
    setTimeout(addTelemetryLog, Math.random() * 3000 + 1000);
  };
  
  if (telemetryOutput) {
    setTimeout(addTelemetryLog, 1000);
  }
});
