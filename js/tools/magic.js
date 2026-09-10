document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('magic-dropzone');
  const fileInput = document.getElementById('magic-file-input');
  const resultsDiv = document.getElementById('magic-results');
  const warningDiv = document.getElementById('magic-warning');
  const extEl = document.getElementById('magic-ext');
  const detectedEl = document.getElementById('magic-detected');
  const sizeEl = document.getElementById('magic-size');
  const entropyEl = document.getElementById('magic-entropy');
  const hexEl = document.getElementById('magic-hex');
  const statusBadge = document.getElementById('magic-status-badge');

  if (!dropzone) return;

  const signatures = [
    { bytes: [0x89, 0x50, 0x4E, 0x47], type: 'image/png', ext: 'png' },
    { bytes: [0xFF, 0xD8, 0xFF], type: 'image/jpeg', ext: 'jpg' },
    { bytes: [0x25, 0x50, 0x44, 0x46], type: 'application/pdf', ext: 'pdf' },
    { bytes: [0x50, 0x4B, 0x03, 0x04], type: 'application/zip', ext: 'zip' },
    { bytes: [0x4D, 0x5A], type: 'application/x-msdownload', ext: 'exe' },
    { bytes: [0x52, 0x61, 0x72, 0x21], type: 'application/x-rar-compressed', ext: 'rar' },
    { bytes: [0x47, 0x49, 0x46, 0x38], type: 'image/gif', ext: 'gif' }
  ];

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateEntropy = (buffer) => {
    const view = new Uint8Array(buffer);
    const frequencies = new Array(256).fill(0);
    for (let i = 0; i < view.length; i++) {
      frequencies[view[i]]++;
    }
    let entropy = 0;
    const len = view.length;
    for (let i = 0; i < 256; i++) {
      if (frequencies[i] > 0) {
        const p = frequencies[i] / len;
        entropy -= p * Math.log2(p);
      }
    }
    return entropy.toFixed(2);
  };

  const analyzeFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target.result;
      const view = new Uint8Array(buffer);
      
      const parts = file.name.split('.');
      const claimedExt = parts.length > 1 ? parts.pop().toLowerCase() : 'none';
      
      const hexArr = [];
      const readLen = Math.min(16, view.length);
      for(let i=0; i<readLen; i++) {
        hexArr.push(view[i].toString(16).padStart(2, '0').toUpperCase());
      }
      
      let matchedType = 'Unknown';
      let matchedExt = '';
      
      for (const sig of signatures) {
        let match = true;
        for (let i = 0; i < sig.bytes.length; i++) {
          if (view[i] !== sig.bytes[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          matchedType = sig.type;
          matchedExt = sig.ext;
          break;
        }
      }

      extEl.textContent = claimedExt.toUpperCase();
      detectedEl.textContent = matchedType.toUpperCase();
      sizeEl.textContent = formatSize(file.size);
      entropyEl.textContent = calculateEntropy(buffer);
      hexEl.textContent = hexArr.join(' ');
      
      const isMismatch = matchedExt !== '' && matchedExt !== claimedExt && claimedExt !== 'none';
      
      if (isMismatch) {
        warningDiv.style.display = 'block';
        statusBadge.textContent = 'HIGH RISK';
        statusBadge.style.backgroundColor = 'var(--error)';
        statusBadge.style.color = '#fff';
      } else {
        warningDiv.style.display = 'none';
        statusBadge.textContent = 'VERIFIED';
        statusBadge.style.backgroundColor = 'var(--accent-green)';
        statusBadge.style.color = '#111';
      }
      
      resultsDiv.style.display = 'block';

      if (window.Utils && window.Utils.logActivity) {
        Utils.logActivity(`File ID: Analysed ${file.name}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  dropzone.addEventListener('click', () => fileInput.click());
  
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.backgroundColor = 'rgba(0, 240, 255, 0.1)';
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.backgroundColor = 'transparent';
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.backgroundColor = 'transparent';
    if (e.dataTransfer.files.length) {
      analyzeFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      analyzeFile(e.target.files[0]);
    }
  });
});
