import { PROFILE_KEY, RESUME_TEXT_KEY, emptyProfile } from './schema.js';

export function getProfile() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([PROFILE_KEY], (result) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      resolve(result[PROFILE_KEY] ?? emptyProfile());
    });
  });
}

export function saveProfile(profile) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [PROFILE_KEY]: profile }, () => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      resolve();
    });
  });
}

export function getResumeText() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([RESUME_TEXT_KEY], (result) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      resolve(result[RESUME_TEXT_KEY] ?? '');
    });
  });
}

export function saveResumeText(text) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [RESUME_TEXT_KEY]: text }, () => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      resolve();
    });
  });
}

export function onProfileChanged(cb) {
  const listener = (changes) => {
    if (PROFILE_KEY in changes) cb(changes[PROFILE_KEY].newValue ?? emptyProfile());
  };
  chrome.storage.local.onChanged.addListener(listener);
  return () => chrome.storage.local.onChanged.removeListener(listener);
}
