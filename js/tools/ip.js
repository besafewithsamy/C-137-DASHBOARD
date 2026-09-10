document.addEventListener('DOMContentLoaded', () => {
  const ipInput = document.getElementById('ip-input');
  const btnLookup = document.getElementById('btn-lookup');
  const ipResults = document.getElementById('ip-results');

  if (!btnLookup) return;

  const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
  const LABEL_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

  const isValidIpv4 = (str) => {
    if (!IPV4_REGEX.test(str)) return false;
    return str.split('.').every(part => {
      const n = parseInt(part, 10);
      return n >= 0 && n <= 255;
    });
  };

  const isValidDomain = (str) => {
    if (str.length === 0 || str.length > 253) return false;
    if (/^[\d.]+$/.test(str)) return false;
    const labels = str.split('.');
    const allValid = labels.every(l => l.length <= 63 && LABEL_REGEX.test(l));
    if (!allValid) return false;
    return labels.some(l => /[a-zA-Z]/.test(l));
  };

  const fetchWithTimeout = async (url, timeoutMs = 10000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };

  const renderResult = (data) => {
    const escape = window.Utils?.escapeHTML || (str => str);
    const hostname = data.connection?.domain || 'N/A';
    const isp = data.connection?.isp || 'N/A';

    ipResults.innerHTML = `
      <div class="flex-col gap-1">
        <p><strong>IP:</strong> ${escape(data.ip || 'N/A')}</p>
        <p><strong>Hostname:</strong> ${escape(hostname)}</p>
        <p><strong>Country:</strong> ${escape(data.country || 'N/A')} (${escape(data.country_code || '')})</p>
        <p><strong>Region:</strong> ${escape(data.region || 'N/A')}</p>
        <p><strong>City:</strong> ${escape(data.city || 'N/A')}</p>
        <p><strong>ISP:</strong> ${escape(isp)}</p>
      </div>
    `;
  };

  const lookup = async () => {
    const rawQuery = ipInput.value.trim();

    if (rawQuery && !isValidIpv4(rawQuery) && !isValidDomain(rawQuery)) {
      ipResults.innerHTML = '<p class="text-error">Invalid target. Enter a valid IPv4 address or domain name.</p>';
      return;
    }

    btnLookup.textContent = 'LOOKING UP...';
    btnLookup.disabled = true;
    ipResults.innerHTML = '<p class="text-muted">Fetching data...</p>';

    try {
      let resolvedIpAddress = rawQuery;

      if (rawQuery && !isValidIpv4(rawQuery)) {
        const dnsResponse = await fetchWithTimeout(
          `https://dns.google/resolve?name=${encodeURIComponent(rawQuery)}&type=A`
        );
        if (!dnsResponse.ok) {
          throw new Error(`DNS HTTP error! status: ${dnsResponse.status}`);
        }
        const dnsData = await dnsResponse.json();

        const aRecord = dnsData.Answer?.find(a => a.type === 1);
        if (aRecord) {
          resolvedIpAddress = aRecord.data;
        } else {
          throw new Error('Domain resolution failed');
        }
      }

      const url = resolvedIpAddress ? `https://ipwho.is/${encodeURIComponent(resolvedIpAddress)}` : 'https://ipwho.is/';
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Lookup failed');
      }

      renderResult(data);
      if (window.Utils) Utils.logActivity(`Looked up IP/Domain: ${rawQuery || 'self'}`);

    } catch (e) {
      if (e.name === 'AbortError') {
        ipResults.innerHTML = '<p class="text-error">Lookup timed out after 10 seconds.</p>';
      } else {
        console.error(e);
        ipResults.innerHTML = '<p class="text-error">Target resolution failed. Please verify the address and try again.</p>';
      }
      if (window.Utils) Utils.showToast('Lookup failed', 'error');
    } finally {
      btnLookup.textContent = 'LOOKUP';
      btnLookup.disabled = false;
    }
  };

  btnLookup.addEventListener('click', lookup);

  ipInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') lookup();
  });
});
