export function initFillButton(btn) {
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    const statusEl = document.getElementById('fill-status');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setStatus(statusEl, 'No active tab found.', 'error');
        return;
      }

      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('about:') ||
          tab.url?.startsWith('chrome-extension://') || tab.url?.startsWith('file://')) {
        setStatus(statusEl, 'Cannot fill on this page.', 'error');
        return;
      }

      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORM' });
      } catch {
        // Content script not injected; inject and retry
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/field-matcher.js', 'content/autofill.js']
        });
        response = await chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORM' });
      }

      if (response?.ok) {
        const msg = response.filledCount === 0
          ? 'No matching fields found.'
          : `Filled ${response.filledCount} field(s)!`;
        setStatus(statusEl, msg, response.filledCount > 0 ? 'success' : 'info');
      } else {
        setStatus(statusEl, response?.error || 'Fill failed.', 'error');
      }
    } catch (err) {
      setStatus(statusEl, `Error: ${err.message}`, 'error');
    } finally {
      btn.disabled = false;
    }
  });
}

function setStatus(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = `status-msg ${type}`;
  setTimeout(() => { if (el) { el.textContent = ''; el.className = 'status-msg'; } }, 4000);
}
