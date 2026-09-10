document.addEventListener('DOMContentLoaded', () => {
  let threatChart = null;

  const initChart = () => {
    const canvas = document.getElementById('threat-activity-chart');
    if (!canvas || !window.MiniChart) return;

    threatChart = new window.MiniChart.DashboardChart(canvas);
    threatChart.setData(
      ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
      [10, 50, 20, 90, 40, 60, 30],
      [5, 15, 10, 25, 20, 15, 30]
    );
  };

  initChart();

  const timeFilters = document.querySelectorAll('#chart-time-filters button');
  timeFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      timeFilters.forEach(b => b.classList.remove('btn-primary'));
      btn.classList.add('btn-primary');

      if (window.AudioEngine) window.AudioEngine.play('bleep');
      if (!threatChart) return;

      const range = btn.dataset.range;
      let labels, threat, bandwidth;

      if (range === '1H') {
        labels = ['-60m', '-50m', '-40m', '-30m', '-20m', '-10m', 'Now'];
        threat = [12, 19, 3, 5, 2, 3, 10];
        bandwidth = [1, 2, 1, 1, 3, 2, 5];
      } else if (range === '24H') {
        labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'];
        threat = [10, 50, 20, 90, 40, 60, 30];
        bandwidth = [5, 15, 10, 25, 20, 15, 30];
      } else if (range === '7D') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        threat = [100, 200, 150, 300, 250, 400, 350];
        bandwidth = [50, 60, 40, 80, 70, 90, 100];
      } else {
        labels = ['W1', 'W2', 'W3', 'W4'];
        threat = [1000, 800, 1200, 950];
        bandwidth = [400, 350, 500, 450];
      }

      threatChart.setData(labels, threat, bandwidth);
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

    const scoreBadge = scoreEl.closest('.card').querySelector('.score-badge');
    if (scoreBadge) {
      scoreBadge.textContent = baseScore > 80 ? 'Optimal' : baseScore > 50 ? 'Elevated' : 'Critical';
      scoreBadge.className = `score-badge ${baseScore > 80 ? 'score-optimal' : baseScore > 50 ? 'score-warn' : 'score-crit'}`;
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
      threatChart.push(Math.floor(Math.random() * 60) + 40, Math.floor(Math.random() * 40) + 20);
    }

    const logs = window.Utils && window.Utils.Storage ? window.Utils.Storage.get('c137_activity') || [] : [];
    if (logs.length > 0 && telemetryOutput) {
      const latestLog = logs[0];
      let level = 'INFO';
      let color = 'var(--text-main)';

      const actionLower = (latestLog.action || '').toLowerCase();
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
        const timeSpan = document.createElement('span');
        timeSpan.style.color = 'var(--text-muted)';
        timeSpan.textContent = latestLog.time;
        const levelTag = document.createElement('strong');
        levelTag.style.color = color;
        levelTag.textContent = `[${level}]`;
        div.append(timeSpan, ' ', levelTag, ' ', latestLog.action);

        telemetryOutput.appendChild(div);
        if (telemetryOutput.childNodes.length > 20) {
          telemetryOutput.removeChild(telemetryOutput.firstChild);
        }
        telemetryOutput.scrollTop = telemetryOutput.scrollHeight;
      }
    }
  });

  updateDynamicScore();
});
