const Utils = {
  escapeHTML: (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  showToast: (message, type = 'info') => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 4000);
  },

  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      Utils.showToast('Copied to clipboard.', 'success');
      Utils.logActivity('Copied data to clipboard');
    } catch (err) {
      Utils.showToast('Failed to copy', 'error');
    }
  },

  logActivity: (action) => {
    const logs = Utils.Storage.get('c137_activity') || [];
    const now = new Date();
    const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
    
    logs.unshift({ time: timeString, action: action });
    if (logs.length > 50) logs.pop();
    
    Utils.Storage.set('c137_activity', logs);
    
    document.dispatchEvent(new Event('activityLogUpdated'));
  },

  Storage: {
    get: (key) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.error('Error reading localStorage', e);
        return null;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Error writing localStorage', e);
      }
    }
  }
};

window.Utils = Utils;
