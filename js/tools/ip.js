document.addEventListener('DOMContentLoaded', () => {
  const ipInput = document.getElementById('ip-input');
  const btnLookup = document.getElementById('btn-lookup');
  const ipResults = document.getElementById('ip-results');

  if (!btnLookup) return;

  btnLookup.addEventListener('click', async () => {
    const query = ipInput.value.trim();
    
    btnLookup.textContent = 'LOOKING UP...';
    btnLookup.disabled = true;
    ipResults.innerHTML = '<p class="text-muted">Fetching data...</p>';

    try {
      let resolvedIpAddress = query;

      if (query && /[a-zA-Z]/.test(query)) {
        const dnsResponse = await fetch(`https://dns.google/resolve?name=${query}&type=A`);
        if (!dnsResponse.ok) {
          throw new Error(`DNS HTTP error! status: ${dnsResponse.status}`);
        }
        const dnsData = await dnsResponse.json();

        if (dnsData.Answer && dnsData.Answer.length > 0) {
          resolvedIpAddress = dnsData.Answer[0].data;
        } else {
          throw new Error('Domain resolution failed');
        }
      }

      const url = resolvedIpAddress ? `https://ipwho.is/${resolvedIpAddress}` : 'https://ipwho.is/';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Lookup failed');
      }

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
      if (window.Utils) Utils.logActivity(`Looked up IP/Domain: ${query || 'self'}`);

    } catch (e) {
      console.error(e);
      ipResults.innerHTML = '<p class="text-error">Target resolution failed. Please verify the address and try again.</p>';
      if (window.Utils) Utils.showToast('Lookup failed', 'error');
    } finally {
      btnLookup.textContent = 'LOOKUP';
      btnLookup.disabled = false;
    }
  });
});
