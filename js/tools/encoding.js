document.addEventListener('DOMContentLoaded', () => {
  const encInput = document.getElementById('enc-input');
  const encOutput = document.getElementById('enc-output');
  const btnEncode = document.getElementById('btn-encode');
  const btnDecode = document.getElementById('btn-decode');
  const btnSwap = document.getElementById('btn-swap');
  const btnCopyEnc = document.getElementById('btn-copy-enc');
  const btnClearEnc = document.getElementById('btn-clear-enc');

  if (!encInput) return;

  btnEncode.addEventListener('click', () => {
    try {
      const str = encInput.value;
      if (!str) return;
      const utf8Bytes = new TextEncoder().encode(str);
      const binaryStr = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');
      encOutput.value = window.btoa(binaryStr);
      if (window.Utils) Utils.logActivity('Encoded text to Base64');
    } catch (e) {
      if (window.Utils) Utils.showToast('Failed to encode input', 'error');
    }
  });

  btnDecode.addEventListener('click', () => {
    try {
      const b64 = encInput.value;
      if (!b64) return;
      const binaryStr = window.atob(b64);
      const bytes = new Uint8Array([...binaryStr].map(char => char.charCodeAt(0)));
      encOutput.value = new TextDecoder().decode(bytes);
      if (window.Utils) Utils.logActivity('Decoded Base64 text');
    } catch (e) {
      if (window.Utils) Utils.showToast('Invalid Base64 input', 'error');
    }
  });

  btnSwap.addEventListener('click', () => {
    const temp = encInput.value;
    encInput.value = encOutput.value;
    encOutput.value = temp;
  });

  btnCopyEnc.addEventListener('click', () => {
    if (encOutput.value && window.Utils) Utils.copyToClipboard(encOutput.value);
  });

  btnClearEnc.addEventListener('click', () => {
    encInput.value = encOutput.value = '';
  });
});
