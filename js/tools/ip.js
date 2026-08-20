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
      const url = query ? `https://ipapi.co/${query}/json/` : 'https://ipapi.co/json/';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.error) {
        throw new Error(data.reason || 'Lookup failed');
      }

      const escape = window.Utils?.escapeHTML || (str => str);

      ipResults.innerHTML = `
        <div class="flex-col gap-1">
          <p><strong>IP:</strong> ${escape(data.ip || 'N/A')}</p>
          <p><strong>Hostname:</strong> ${escape(data.hostname || 'N/A')}</p>
          <p><strong>City:</strong> ${escape(data.city || 'N/A')}</p>
          <p><strong>Region:</strong> ${escape(data.region || 'N/A')}</p>
          <p><strong>Country:</strong> ${escape(data.country_name || 'N/A')} (${escape(data.country_code || '')})</p>
          <p><strong>ISP:</strong> ${escape(data.org || 'N/A')}</p>
          <p><strong>Timezone:</strong> ${escape(data.timezone || 'N/A')}</p>
        </div>
      `;
      if (window.Utils) Utils.logActivity(`Looked up IP/Domain: ${query || 'self'}`);

    } catch (e) {
      console.error(e);
      const escape = window.Utils?.escapeHTML || (str => str);
      ipResults.innerHTML = `<p class="text-error">Lookup failed: ${escape(e.message)}. Please check input or rate limits.</p>`;
      if (window.Utils) Utils.showToast('Lookup failed', 'error');
    } finally {
      btnLookup.textContent = 'LOOKUP';
      btnLookup.disabled = false;
    }
  });
});
