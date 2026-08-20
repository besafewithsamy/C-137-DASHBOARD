document.addEventListener('DOMContentLoaded', () => {
  const hashInput = document.getElementById('hash-input');
  const out256 = document.getElementById('hash-out-256');
  const out384 = document.getElementById('hash-out-384');
  const out512 = document.getElementById('hash-out-512');
  
  const btnCopy256 = document.getElementById('btn-copy-256');
  const btnCopy384 = document.getElementById('btn-copy-384');
  const btnCopy512 = document.getElementById('btn-copy-512');
  const btnClearHash = document.getElementById('btn-clear-hash');

  if (!hashInput) return;

  const generateHash = async (text, algorithm) => {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API not available in this browser/context.');
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest(algorithm, data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  let hashTimeout;

  const updateHashes = async () => {
    const text = hashInput.value;
    if (!text) {
      out256.value = out384.value = out512.value = '';
      return;
    }

    try {
      const [h256, h384, h512] = await Promise.all([
        generateHash(text, 'SHA-256'),
        generateHash(text, 'SHA-384'),
        generateHash(text, 'SHA-512')
      ]);
      
      out256.value = h256;
      out384.value = h384;
      out512.value = h512;
    } catch (e) {
      console.error('Hash generation error:', e);
      if (window.Utils) Utils.showToast(e.message || 'Error generating hashes', 'error');
    }
  };

  hashInput.addEventListener('input', () => {
    clearTimeout(hashTimeout);
    hashTimeout = setTimeout(updateHashes, 300);
  });

  hashInput.addEventListener('change', () => {
    if (hashInput.value && window.Utils) {
      Utils.logActivity('Generated hashes');
    }
  });

  const copy = (val) => val && window.Utils && Utils.copyToClipboard(val);
  
  btnCopy256.addEventListener('click', () => copy(out256.value));
  btnCopy384.addEventListener('click', () => copy(out384.value));
  btnCopy512.addEventListener('click', () => copy(out512.value));

  btnClearHash.addEventListener('click', () => {
    hashInput.value = out256.value = out384.value = out512.value = '';
  });
});
