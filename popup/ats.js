import { getProfile, getResumeText } from '../lib/storage.js';
import { scoreResume } from '../lib/ats-engine.js';
import { ATS_LAST_KEY } from '../lib/schema.js';

export function initAtsPanel(root) {
  root.innerHTML = '';

  // Build UI
  const jdGroup = document.createElement('div');
  jdGroup.className = 'form-group';
  const jdLabel = document.createElement('label');
  jdLabel.textContent = 'Paste Job Description';
  jdLabel.htmlFor = 'jd-input';
  const jdTextarea = document.createElement('textarea');
  jdTextarea.id = 'jd-input';
  jdTextarea.className = 'form-input';
  jdTextarea.rows = 6;
  jdTextarea.placeholder = 'Paste the job description here...';
  jdGroup.appendChild(jdLabel);
  jdGroup.appendChild(jdTextarea);

  const scoreBtn = document.createElement('button');
  scoreBtn.className = 'btn-primary';
  scoreBtn.id = 'score-btn';
  scoreBtn.textContent = 'Score Resume';

  const resultsDiv = document.createElement('div');
  resultsDiv.id = 'ats-results';
  resultsDiv.className = 'ats-results hidden';

  const scoreSection = document.createElement('div');
  scoreSection.className = 'score-section';
  const scoreLabel = document.createElement('div');
  scoreLabel.className = 'score-label';
  scoreLabel.id = 'score-label';
  const scoreBar = document.createElement('div');
  scoreBar.className = 'score-bar';
  const scoreFill = document.createElement('div');
  scoreFill.className = 'score-fill';
  scoreFill.id = 'score-fill';
  scoreBar.appendChild(scoreFill);
  scoreSection.appendChild(scoreLabel);
  scoreSection.appendChild(scoreBar);

  const matchedSection = document.createElement('div');
  matchedSection.className = 'keyword-section';
  const matchedTitle = document.createElement('h3');
  matchedTitle.textContent = 'Matched Keywords';
  const matchedContainer = document.createElement('div');
  matchedContainer.className = 'chip-container';
  matchedContainer.id = 'matched-chips';
  matchedSection.appendChild(matchedTitle);
  matchedSection.appendChild(matchedContainer);

  const missingSection = document.createElement('div');
  missingSection.className = 'keyword-section';
  const missingTitle = document.createElement('h3');
  missingTitle.textContent = 'Missing Keywords';
  const missingContainer = document.createElement('div');
  missingContainer.className = 'chip-container';
  missingContainer.id = 'missing-chips';
  missingSection.appendChild(missingTitle);
  missingSection.appendChild(missingContainer);

  const suggestionsSection = document.createElement('div');
  suggestionsSection.className = 'suggestions-section';
  const suggestionsTitle = document.createElement('h3');
  suggestionsTitle.textContent = 'Suggested Rewrites';
  const suggestionsList = document.createElement('ul');
  suggestionsList.id = 'suggestions-list';
  suggestionsSection.appendChild(suggestionsTitle);
  suggestionsSection.appendChild(suggestionsList);

  resultsDiv.appendChild(scoreSection);
  resultsDiv.appendChild(matchedSection);
  resultsDiv.appendChild(missingSection);
  resultsDiv.appendChild(suggestionsSection);

  root.appendChild(jdGroup);
  root.appendChild(scoreBtn);
  root.appendChild(resultsDiv);

  // Score button handler
  scoreBtn.addEventListener('click', async () => {
    const jd = jdTextarea.value.trim();
    if (!jd) return;

    scoreBtn.disabled = true;
    scoreBtn.textContent = 'Scoring...';

    try {
      const [profile, resumeText] = await Promise.all([getProfile(), getResumeText()]);
      const result = scoreResume({ resumeText, profile, jobDescription: jd });

      chrome.storage.local.set({ [ATS_LAST_KEY]: { ...result, jd } }, () => {
        if (chrome.runtime.lastError) console.warn('ATS save failed:', chrome.runtime.lastError.message);
      });

      renderResults(result);
    } catch (err) {
      resultsDiv.classList.remove('hidden');
      scoreLabel.textContent = `Error: ${err.message}`;
    } finally {
      scoreBtn.disabled = false;
      scoreBtn.textContent = 'Score Resume';
    }
  });

  // Invalidate stale scores on profile update
  window.addEventListener('profile:updated', () => {
    document.getElementById('ats-results')?.classList.add('hidden');
    document.getElementById('jd-input') && (document.getElementById('jd-input').style.borderColor = '');
  });
}

function renderResults(result) {
  const resultsDiv = document.getElementById('ats-results');
  const scoreLabel = document.getElementById('score-label');
  const scoreFill = document.getElementById('score-fill');
  const matchedContainer = document.getElementById('matched-chips');
  const missingContainer = document.getElementById('missing-chips');
  const suggestionsList = document.getElementById('suggestions-list');

  resultsDiv.classList.remove('hidden');

  scoreLabel.textContent = '';
  const scoreText = document.createTextNode(`ATS Score: ${result.score}%`);
  scoreLabel.appendChild(scoreText);

  scoreFill.style.width = `${result.score}%`;
  scoreFill.style.backgroundColor = result.score >= 70 ? 'var(--green)' : result.score >= 40 ? '#f59e0b' : 'var(--red)';

  matchedContainer.innerHTML = '';
  for (const kw of result.matched) {
    const chip = document.createElement('span');
    chip.className = 'chip chip-green';
    chip.textContent = kw;
    matchedContainer.appendChild(chip);
  }

  missingContainer.innerHTML = '';
  for (const kw of result.missing) {
    const chip = document.createElement('span');
    chip.className = 'chip chip-red';
    chip.textContent = kw;
    missingContainer.appendChild(chip);
  }

  suggestionsList.innerHTML = '';
  for (const { keyword, suggestion } of result.suggestions) {
    const li = document.createElement('li');
    const text = document.createTextNode(suggestion);
    li.appendChild(text);
    suggestionsList.appendChild(li);
  }
}
