document.addEventListener('DOMContentLoaded', () => {
  const scanTarget = document.getElementById('scan-target');
  const scanPorts = document.getElementById('scan-ports');
  const btnScan = document.getElementById('btn-scan');
  const btnCancel = document.getElementById('btn-scan-cancel');
  const scanResults = document.getElementById('scan-results');
  const progressContainer = document.getElementById('scan-progress-container');
  const progressBar = document.getElementById('scan-progress');

  if (!btnScan) return;

  const COMMON_PORTS = {
    21: 'FTP', 22: 'SSH', 23: 'TELNET', 25: 'SMTP',
    53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP',
    443: 'HTTPS', 445: 'SMB', 3306: 'MYSQL',
    3389: 'RDP', 8080: 'HTTP-PROXY'
  };

  let scanning = false;
  let cancelled = false;
  let scanTimeout = null;

  const cancelScan = () => {
    if (!scanning) return;
    cancelled = true;
    clearTimeout(scanTimeout);
    finishScan(true);
  };

  const finishScan = (wasCancelled = false) => {
    scanning = false;
    btnScan.textContent = 'START SCAN';
    btnScan.disabled = false;
    btnCancel.style.display = 'none';
    progressContainer.style.display = 'none';

    if (openPorts.length > 0) {
      const summary = document.createElement('p');
      summary.className = 'text-cyan mt-2';
      summary.style.marginTop = '0.5rem';
      summary.textContent = `${wasCancelled ? 'SCAN ABORTED' : 'Scan Complete'}. ${openPorts.length} open port(s): ${openPorts.join(', ')}`;
      consoleDiv.appendChild(summary);
    } else {
      const summary = document.createElement('p');
      summary.className = 'text-muted mt-2';
      summary.textContent = `${wasCancelled ? 'SCAN ABORTED' : 'Scan Complete'}. No open ports found.`;
      consoleDiv.appendChild(summary);
    }

    scanResults.scrollTop = scanResults.scrollHeight;
    if (window.Utils) Utils.logActivity(wasCancelled ? 'Port scan simulation cancelled' : 'Finished port scan simulation');
  };

  let consoleDiv = null;
  let openPorts = [];

  btnScan.addEventListener('click', () => {
    if (scanning) return;

    const target = scanTarget.value.trim();
    const range = scanPorts.value.trim();

    if (!target) {
      if (window.Utils) Utils.showToast('Please enter a target', 'error');
      return;
    }

    const rangeParts = range.split('-').map(p => p.trim());
    const minPort = parseInt(rangeParts[0], 10);
    const maxPort = rangeParts.length > 1 ? parseInt(rangeParts[1], 10) : minPort;

    if (isNaN(minPort) || isNaN(maxPort) || minPort < 1 || maxPort > 65535 || minPort > maxPort) {
      if (window.Utils) Utils.showToast('Invalid port range', 'error');
      return;
    }

    scanning = true;
    cancelled = false;
    openPorts = [];
    btnScan.textContent = 'SCANNING...';
    btnScan.disabled = true;
    btnCancel.style.display = 'inline-flex';
    progressContainer.style.display = 'block';
    scanResults.innerHTML = '';

    if (window.Utils) Utils.logActivity(`Started port scan simulation on ${target}`);

    const totalPorts = maxPort - minPort + 1;
    const scanDelay = Math.max(10, Math.min(100, 3000 / totalPorts));

    consoleDiv = document.createElement('div');
    consoleDiv.style.fontFamily = 'var(--font-mono)';
    consoleDiv.style.fontSize = '0.9rem';
    scanResults.appendChild(consoleDiv);

    const startLine = document.createElement('p');
    startLine.className = 'text-cyan';
    startLine.textContent = `Starting C-137 simulated scan against ${target} (ports ${minPort}-${maxPort})...`;
    consoleDiv.appendChild(startLine);

    let currentPort = minPort;
    let pendingLines = [];

    const flushLines = () => {
      if (pendingLines.length === 0) return;
      const frag = document.createDocumentFragment();
      pendingLines.forEach(({ className, text }) => {
        const p = document.createElement('p');
        p.className = className;
        p.textContent = text;
        frag.appendChild(p);
      });
      consoleDiv.appendChild(frag);
      pendingLines = [];
      scanResults.scrollTop = scanResults.scrollHeight;
    };

    const scanStep = () => {
      if (cancelled) return;
      if (currentPort > maxPort) {
        flushLines();
        finishScan(false);
        return;
      }

      const r = Math.random();
      const isCommon = COMMON_PORTS[currentPort];
      const isOpen = (isCommon && r > 0.3) || r > 0.98;

      if (isOpen) {
        const service = isCommon || 'UNKNOWN';
        pendingLines.push({ className: 'text-success', text: `[+] Port ${currentPort}/tcp is OPEN (${service})` });
        openPorts.push(currentPort);
      }

      const scanned = currentPort - minPort + 1;
      const pct = Math.round((scanned / totalPorts) * 100);
      progressBar.style.width = `${pct}%`;

      if (scanned % 50 === 0) flushLines();

      currentPort++;
      scanTimeout = setTimeout(scanStep, scanDelay);
    };

    scanStep();
  });

  if (btnCancel) {
    btnCancel.addEventListener('click', cancelScan);
  }
});
