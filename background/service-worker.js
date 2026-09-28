import { PROFILE_KEY, emptyProfile } from '../lib/schema.js';

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.get([PROFILE_KEY], (result) => {
      if (chrome.runtime.lastError) return;
      if (!result[PROFILE_KEY]) {
        chrome.storage.local.set({ [PROFILE_KEY]: emptyProfile() }, () => {
          if (chrome.runtime.lastError) console.warn('Failed to seed profile:', chrome.runtime.lastError.message);
        });
      }
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'fill-form') return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://') ||
      tab.url?.startsWith('about:') || tab.url?.startsWith('file://')) {
    console.warn('Cannot auto-fill on restricted page:', tab.url);
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORM' });
  } catch {
    // Content script not injected — inject and retry
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/field-matcher.js', 'content/autofill.js']
      });
      await chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORM' });
    } catch (err) {
      console.error('Auto-fill failed:', err);
    }
  }
});
