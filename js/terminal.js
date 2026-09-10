document.addEventListener('DOMContentLoaded', () => {
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');

  if (!terminalInput || !terminalOutput) return;

  const MODULES = {
    dashboard: { target: 'view-dashboard', desc: 'Main console' },
    password: { target: 'view-password', desc: 'Password Strength Checker' },
    generator: { target: 'view-generator', desc: 'Password Generator' },
    hash: { target: 'view-hash', desc: 'Hash Generator' },
    encoding: { target: 'view-encoding', desc: 'Base64 Encoder/Decoder' },
    magic: { target: 'view-magic', desc: 'File Identifier (magic bytes)' },
    phishing: { target: 'view-phishing', desc: 'Phishing Simulator & Analyzer' },
    ip: { target: 'view-ip', desc: 'IP/Domain Lookup' },
    scanner: { target: 'view-scanner', desc: 'Port Scanner (simulation)' },
    terminal: { target: 'view-terminal', desc: 'This terminal' },
    logs: { target: 'view-logs', desc: 'Activity log' },
    about: { target: 'view-about', desc: 'Help / diagnostics' }
  };

  const COMMANDS = ['help', 'clear', 'status', 'neofetch', 'tools', 'open', 'holo'];

  const asciiLogo = `
   _____          __  ____   _____ 
  / ____|        / | |___ \\ |___  |
 | |       ____  | |   __) |   / / 
 | |      |____| | |  |__ <   / /  
 | |____         | |  ___) | / /   
  \\_____|        |_| |____/ /_/    
                                    
`;

  const printLine = (text, className = '') => {
    const div = document.createElement('div');
    div.className = `terminal-line ${className}`;

    if (className.includes('neofetch')) {
      const pre = document.createElement('pre');
      pre.style.fontFamily = 'monospace';
      pre.style.lineHeight = '1.2';
      pre.textContent = text;
      div.appendChild(pre);
    } else {
      div.textContent = text;
    }

    terminalOutput.appendChild(div);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  };

  const printModuleList = (title) => {
    printLine(title, 'text-muted');
    Object.entries(MODULES).forEach(([name, mod]) => {
      printLine(`  ${name.padEnd(10)} - ${mod.desc}`, 'text-muted');
    });
  };

  const commandHistory = [];
  let historyIndex = -1;

  const processCommand = (cmd) => {
    const args = cmd.trim().split(' ').filter(Boolean);
    if (!args.length) return;

    const command = args[0].toLowerCase();
    printLine(`> ${cmd}`, 'text-cyan');

    switch (command) {
      case 'help':
        printLine('Available commands:\n' +
          '  help      - Show this help message\n' +
          '  clear     - Clear terminal screen\n' +
          '  status    - Show system status\n' +
          '  neofetch  - System information\n' +
          '  tools     - List available tools\n' +
          '  open      - Open a tool (e.g. open hash, open password)\n' +
          '  holo      - Toggle hologram mode\n' +
          '  \u2191/\u2193      - Browse command history', 'text-muted');
        break;

      case 'clear':
        terminalOutput.innerHTML = '';
        break;

      case 'status':
        printLine('SYSTEM ONLINE [DIMENSION C-137]', 'text-success');
        printLine(`USER: rick_sanchez\nTIME: ${new Date().toISOString()}\nPORTAL FLUID: 87%\nCRYPTO API: ${window.crypto ? 'Available' : 'Unavailable'}`);
        break;

      case 'neofetch':
        printLine(asciiLogo, 'text-purple neofetch');
        printLine(`OS: C-137 Web Environment\nAgent: ${navigator.userAgent.substring(0, 60)}...`);
        break;

      case 'tools':
        printModuleList('Installed Modules:');
        break;

      case 'holo':
        document.body.classList.toggle('scanlines');
        if (window.AudioEngine) window.AudioEngine.play('bleep');
        printLine(document.body.classList.contains('scanlines') ? 'Hologram mode: ON' : 'Hologram mode: OFF', 'text-success');
        break;

      case 'open': {
        const target = args[1] ? args[1].toLowerCase() : null;
        if (!target) {
          printLine('Usage: open <tool_name>', 'text-error');
          break;
        }

        if (MODULES[target]) {
          printLine(`Initiating portal to ${target}...`, 'text-success');
          setTimeout(() => {
            if (window.App?.switchView) {
              window.App.switchView(MODULES[target].target);
            }
          }, 500);
        } else {
          printLine(`Module not found: ${target}. Type 'tools' to see available modules.`, 'text-error');
        }
        break;
      }

      default:
        printLine(`Command not recognized in this dimension: ${command}. Type 'help'.`, 'text-error');
    }

    if (window.Utils?.logActivity) {
      Utils.logActivity(`Executed console command: ${command}`);
    }
  };

  const tabComplete = () => {
    const parts = terminalInput.value.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return;

    if (parts.length === 1) {
      const matches = COMMANDS.filter(c => c.startsWith(parts[0].toLowerCase()));
      if (matches.length === 1) {
        terminalInput.value = matches[0] + ' ';
      } else if (matches.length > 1) {
        printLine(matches.join('  '), 'text-muted');
      }
    } else if (parts[0].toLowerCase() === 'open') {
      const matches = Object.keys(MODULES).filter(m => m.startsWith((parts[1] || '').toLowerCase()));
      if (matches.length === 1) {
        terminalInput.value = `open ${matches[0]}`;
      } else if (matches.length > 1) {
        printLine(matches.join('  '), 'text-muted');
      }
    }
  };

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = terminalInput.value;
      if (cmd.trim()) {
        if (commandHistory[commandHistory.length - 1] !== cmd) {
          commandHistory.push(cmd);
          if (commandHistory.length > 50) commandHistory.shift();
        }
        historyIndex = commandHistory.length;
      }
      terminalInput.value = '';
      processCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      historyIndex = Math.max(0, historyIndex - 1);
      terminalInput.value = commandHistory[historyIndex] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      historyIndex = Math.min(commandHistory.length, historyIndex + 1);
      terminalInput.value = commandHistory[historyIndex] || '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      tabComplete();
    }
  });

  printLine('C-137 DASHBOARD v2.0.0 initializing...');
  printLine('Citadel link offline.', 'text-muted');
  printLine('Type "help" for a list of commands. Tab completes, \u2191/\u2193 for history.', 'text-muted');
});
