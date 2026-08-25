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
          borderColor: '#00FF87',
          backgroundColor: 'rgba(0, 255, 135, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Bandwidth (MB/s)',
          data: [5, 15, 10, 25, 20, 15, 30],
          borderColor: '#00E5FF',
          backgroundColor: 'rgba(0, 229, 255, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: true,
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
      
      if (window.AudioEngine) window.AudioEngine.play('bleep');

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

  const telemetryOutput = document.getElementById('telemetry-output');
  const filterCheckboxes = document.querySelectorAll('#telemetry-filters input');
  
  const getActiveLevels = () => {
    return Array.from(filterCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  };

  document.addEventListener('activityLogUpdated', () => {
    updateDynamicScore();

    if (threatChart) {
      const tData = threatChart.data.datasets[0].data;
      const bData = threatChart.data.datasets[1].data;
      
      tData.shift();
      bData.shift();
      
      tData.push(Math.floor(Math.random() * 60) + 40);
      bData.push(Math.floor(Math.random() * 40) + 20);
      
      threatChart.update();
    }

    const logs = window.Utils && window.Utils.Storage ? window.Utils.Storage.get('c137_activity') || [] : [];
    if (logs.length > 0 && telemetryOutput) {
      const latestLog = logs[0];
      let level = 'INFO';
      let color = 'var(--text-main)';
      
      const actionLower = latestLog.action.toLowerCase();
      if (actionLower.includes('phishing') || actionLower.includes('incorrect') || actionLower.includes('error') || actionLower.includes('fail')) {
        level = 'WARN';
        color = 'var(--accent-yellow)';
      }
      if (actionLower.includes('scan') || actionLower.includes('critical') || actionLower.includes('malicious')) {
        level = 'CRITICAL';
        color = 'var(--error)';
        if (window.AudioEngine) {
            window.AudioEngine.play('beep');
        }
      }

      const activeLevels = getActiveLevels();
      if (activeLevels.includes(level)) {
        const div = document.createElement('div');
        div.style.marginBottom = '4px';
        div.innerHTML = `<span style="color: var(--text-muted);">${latestLog.time}</span> <strong style="color: ${color};">[${level}]</strong> ${latestLog.action}`;
        
        telemetryOutput.appendChild(div);
        if (telemetryOutput.childNodes.length > 20) {
          telemetryOutput.removeChild(telemetryOutput.firstChild);
        }
        telemetryOutput.scrollTop = telemetryOutput.scrollHeight;
      }
    }
  });
});
