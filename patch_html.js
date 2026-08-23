const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace sidebar and topbar with new top header
html = html.replace(/<aside id="sidebar">[\s\S]*?<\/aside>/, '');
html = html.replace(/<header class="topbar">[\s\S]*?<\/header>/, `
      <header class="top-nav-header">
        <div class="logo-area">
          <h2>C-137 DASHBOARD</h2>
        </div>
        <nav class="top-nav">
          <ul>
            <li class="nav-item active" data-target="view-dashboard">OVERVIEW</li>
            <li class="nav-item dropdown-trigger" data-target="view-password">
              SECURITY TOOLS
            </li>
            <li class="nav-item dropdown-trigger" data-target="view-ip">
              NETWORK
            </li>
            <li class="nav-item" data-target="view-terminal">TERMINAL</li>
            <li class="nav-item" data-target="view-logs">LOGS</li>
            <li class="nav-item" data-target="view-about">HELP</li>
          </ul>
        </nav>
        <div class="user-profile">
          <div class="avatar-icon"></div>
          <div class="user-info">
            <span class="user-name">Rick Sanchez</span>
            <span class="session-tag">Session: Alpha-7 <span class="live-badge">Live</span></span>
          </div>
        </div>
      </header>
`);

// Extract Terminal to view-terminal
let terminalMatch = html.match(/<div class="card" style="padding: 1rem; margin-top: 1rem;">\s*<h3 class="card-title">TERMINAL UPLINK<\/h3>[\s\S]*?<\/div>\s*<\/div>/);
if (terminalMatch) {
    let termHtml = terminalMatch[0];
    termHtml = termHtml.substring(0, termHtml.lastIndexOf('</div>')); // remove last </div> which belongs to view-dashboard if we match too much? No wait
    html = html.replace(terminalMatch[0], ''); // remove from dashboard
    
    // Actually regex might be tricky. Let's do it manually.
}
fs.writeFileSync('index.html', html);
