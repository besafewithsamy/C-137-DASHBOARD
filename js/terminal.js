document.addEventListener('DOMContentLoaded', () => {
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  
  if (!terminalInput || !terminalOutput) return;

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

  const processCommand = (cmd) => {
    const args = cmd.trim().split(' ').filter(Boolean);
    if (!args.length) return;
    
    const command = args[0].toLowerCase();
    printLine(`> ${cmd}`, 'text-cyan');

    switch (command) {
      case 'help':
        printLine('Available commands:\n  help      - Show this help message\n  clear     - Clear terminal screen\n  status    - Show system status\n  neofetch  - System information\n  tools     - List available tools\n  open      - Open a tool (e.g. open hash, open password)', 'text-muted');
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
        printLine(`OS: C-137 Web Environment\nAgent: ${navigator.userAgent.substring(0, 50)}...`);
        break;

      case 'tools':
        printLine('Installed Modules:\n  - password  (Strength Checker)\n  - generator (Password Generator)\n  - hash      (Hash Generator)\n  - encoding  (Base64 Converter)\n  - ip        (IP/Domain Lookup)\n  - scanner   (Port Scanner Sim)');
        break;

      case 'open': {
        const target = args[1];
        if (!target) {
          printLine('Usage: open <tool_name>', 'text-error');
          break;
        }
        
        const validTargets = ['password', 'generator', 'hash', 'encoding', 'ip', 'scanner'];
        if (validTargets.includes(target)) {
          printLine(`Initiating portal to ${target}...`, 'text-success');
          setTimeout(() => {
            if(window.App?.switchView) {
              window.App.switchView(`view-${target}`);
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

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = terminalInput.value;
      terminalInput.value = '';
      processCommand(cmd);
    }
  });

  printLine('C-137 DASHBOARD v2.0.0 initializing...');
  printLine('Citadel link offline.', 'text-muted');
  printLine('Type "help" for a list of commands.', 'text-muted');
});
