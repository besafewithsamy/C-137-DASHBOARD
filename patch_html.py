import re

with open('index.html', 'r') as f:
    html = f.read()

# Fix Password Generator Output
html = re.sub(
    r'<div class="flex-row gap-1">\s*<input type="text" id="gen-output" [^>]+>\s*<button id="btn-copy-gen" class="btn btn-primary">COPY</button>\s*</div>',
    '<div class="integrated-input"><input type="text" id="gen-output" readonly style="color: var(--accent-green); font-size: 1.1rem; text-align: center;"><button id="btn-copy-gen" class="btn-icon">📋</button></div>',
    html
)

# Fix Hash outputs
html = re.sub(
    r'<div class="flex-row gap-1">\s*<input type="text" id="hash-out-256" readonly [^>]+>\s*<button id="btn-copy-256" class="btn">COPY</button>\s*</div>',
    '<div class="integrated-input"><input type="text" id="hash-out-256" readonly style="color: var(--text-main);"><button id="btn-copy-256" class="btn-icon">📋</button></div>',
    html
)
html = re.sub(
    r'<div class="flex-row gap-1">\s*<input type="text" id="hash-out-384" readonly [^>]+>\s*<button id="btn-copy-384" class="btn">COPY</button>\s*</div>',
    '<div class="integrated-input"><input type="text" id="hash-out-384" readonly style="color: var(--text-main);"><button id="btn-copy-384" class="btn-icon">📋</button></div>',
    html
)
html = re.sub(
    r'<div class="flex-row gap-1">\s*<input type="text" id="hash-out-512" readonly [^>]+>\s*<button id="btn-copy-512" class="btn">COPY</button>\s*</div>',
    '<div class="integrated-input"><input type="text" id="hash-out-512" readonly style="color: var(--text-main);"><button id="btn-copy-512" class="btn-icon">📋</button></div>',
    html
)

# Fix Network Lookups
html = re.sub(
    r'<div class="flex-row gap-1">\s*<input type="text" id="ip-input"[^>]*>\s*<button id="btn-lookup" class="btn btn-primary">LOOKUP</button>\s*</div>',
    '<div class="flex-row gap-1"><input type="text" id="ip-input" placeholder="e.g. 8.8.8.8 or example.com"><button id="btn-lookup" class="btn btn-primary">LOOKUP</button></div>',
    html
)

# Clean up CSS inline styles that conflict with light theme
html = html.replace('background: rgba(0,0,0,0.3);', 'background: var(--bg-input);')
html = html.replace('background-color: rgba(0,0,0,0.6); border: 1px dashed var(--accent-cyan);', 'background-color: var(--bg-input); border: 1px solid var(--border-color);')
html = html.replace('background: rgba(0,0,0,0.4);', 'background: var(--bg-input);')

# Fix text colors for checkboxes and inputs
html = html.replace('text-shadow: 0 0 5px var(--accent-green-dim);', '')
html = html.replace('text-shadow: 0 0 5px var(--accent-cyan-dim);', '')

with open('index.html', 'w') as f:
    f.write(html)
