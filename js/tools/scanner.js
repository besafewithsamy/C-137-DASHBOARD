document.addEventListener('DOMContentLoaded', () => {
  const scanTarget = document.getElementById('scan-target');
  const scanPorts = document.getElementById('scan-ports');
  const btnScan = document.getElementById('btn-scan');
  const scanResults = document.getElementById('scan-results');

  if (!btnScan) return;

  const COMMON_PORTS = {
    21: 'FTP', 22: 'SSH', 23: 'TELNET', 25: 'SMTP',
    53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP',
    443: 'HTTPS', 445: 'SMB', 3306: 'MYSQL',
    3389: 'RDP', 8080: 'HTTP-PROXY'
  };

  let scanning = false;

  btnScan.addEventListener('click', () => {
    if (scanning) return;
    
    const target = scanTarget.value.trim();
    const range = scanPorts.value.trim();

    if (!target) {
      if (window.Utils) Utils.showToast('Please enter a target', 'error');
      return;
    }

    const rangeParts = range.split('-');
    const minPort = parseInt(rangeParts[0], 10) || 1;
    const maxPort = parseInt(rangeParts[1] || rangeParts[0], 10) || 100;

    if (isNaN(minPort) || isNaN(maxPort) || minPort < 1 || maxPort > 65535 || minPort > maxPort) {
      if (window.Utils) Utils.showToast('Invalid port range', 'error');
      return;
    }

    scanning = true;
    btnScan.textContent = 'SCANNING...';
    btnScan.disabled = true;
    scanResults.innerHTML = '';
    
    if (window.Utils) Utils.logActivity(`Started port scan simulation on ${target}`);

    const totalPortsToScan = maxPort - minPort + 1;
    const scanDelay = Math.max(10, Math.min(100, 3000 / totalPortsToScan));
    
    const consoleDiv = document.createElement('div');
    consoleDiv.style.fontFamily = 'var(--font-mono)';
    consoleDiv.style.fontSize = '0.9rem';
    scanResults.appendChild(consoleDiv);
    
    const escape = window.Utils?.escapeHTML || (str => str);
    consoleDiv.innerHTML += `<p class="text-cyan">Starting C-137 simulated scan against ${escape(target)}...</p>`;
    
    let currentPort = minPort;
    
    const scanStep = () => {
      if (currentPort > maxPort) {
        scanning = false;
        btnScan.textContent = 'START SCAN';
        btnScan.disabled = false;
        consoleDiv.innerHTML += `<p class="text-success mt-2">Scan Complete.</p>`;
        if (window.Utils) Utils.logActivity(`Finished port scan simulation`);
        return;
      }

      const r = Math.random();
      const isCommon = COMMON_PORTS[currentPort];
      const isOpen = (isCommon && r > 0.3) || r > 0.98;

      if (isOpen) {
        const service = isCommon || 'UNKNOWN';
        consoleDiv.innerHTML += `<p class="text-success">[+] Port ${currentPort}/tcp is OPEN (${service})</p>`;
        scanResults.scrollTop = scanResults.scrollHeight;
      }

      currentPort++;
      setTimeout(scanStep, scanDelay);
    };

    scanStep();
  });
});
