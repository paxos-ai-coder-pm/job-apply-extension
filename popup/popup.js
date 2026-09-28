import { getProfile, saveProfile, getResumeText, saveResumeText } from '../lib/storage.js';
import { renderProfileForm, readProfileForm } from './profile-form.js';
import { extractPdfText } from '../lib/pdf-extract.js';

let currentProfile = null;

async function init() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`panel-${tab}`).classList.add('active');
    });
  });

  // Load profile and render form
  currentProfile = await getProfile();
  const formContainer = document.getElementById('profile-form-container');
  renderProfileForm(formContainer, currentProfile);

  // Save profile button
  document.getElementById('save-profile-btn').addEventListener('click', async () => {
    const updated = readProfileForm(currentProfile);
    currentProfile = updated;
    try {
      await saveProfile(updated);
      showStatus('save-status', 'Profile saved!', 'success');
      window.dispatchEvent(new CustomEvent('profile:updated'));
    } catch (err) {
      showStatus('save-status', `Error: ${err.message}`, 'error');
    }
  });

  // PDF upload
  document.getElementById('pdf-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showStatus('pdf-status', 'Extracting text...', 'info');
    try {
      const { text, pageCount } = await extractPdfText(file);
      await saveResumeText(text);
      showStatus('pdf-status', `Extracted ${pageCount} page(s), ${text.length} characters.`, 'success');
      window.dispatchEvent(new CustomEvent('profile:updated'));
    } catch (err) {
      showStatus('pdf-status', `Error: ${err.message}`, 'error');
    }
  });

  // Dynamically load dev-2 modules (graceful if not yet present)
  try {
    const { initAtsPanel } = await import('./ats.js');
    initAtsPanel(document.getElementById('ats-panel'));
  } catch (e) {
    document.getElementById('ats-panel').textContent = 'ATS module loading...';
  }

  try {
    const { initFillButton } = await import('./autofill-trigger.js');
    initFillButton(document.getElementById('fill-form-btn'));
  } catch (e) {
    // autofill-trigger not yet present
  }
}

function showStatus(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `status-msg ${type}`;
  setTimeout(() => { el.textContent = ''; el.className = 'status-msg'; }, 4000);
}

export function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

init().catch(console.error);
