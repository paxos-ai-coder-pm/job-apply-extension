# Job Apply Assistant

A Chrome Extension (Manifest V3) that automates job applications with profile storage, ATS keyword scoring, and form auto-fill.

## Features

- **Profile storage** — store your personal info, contact details, skills, and work summary in chrome.storage.local
- **Resume PDF extraction** — upload a PDF resume to extract text for ATS analysis
- **ATS Score** — compare your resume against a job description and get a keyword match score
- **Auto-fill** — automatically fill job application forms with your saved profile data
- **Keyboard shortcut** — `Ctrl+Shift+F` (Windows/Linux) or `Command+Shift+F` (Mac) to trigger form fill

## Installation (Developer Mode)

1. Clone or download this repository
2. Install real pdf.js files (see below)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (top-right toggle)
5. Click "Load unpacked" and select this directory

## PDF.js Setup

The `lib/pdfjs/` directory needs the real pdf.js files from [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist):

```bash
npm install pdfjs-dist
cp node_modules/pdfjs-dist/legacy/build/pdf.mjs lib/pdfjs/pdf.mjs
cp node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs lib/pdfjs/pdf.worker.mjs
```

The real files are already included in `lib/pdfjs/` if you received the full build.

## Project Structure

```
manifest.json               Extension manifest (MV3)
background/
  service-worker.js         Background service worker (keyboard shortcut handler)
content/
  field-matcher.js          Form field detection (dev-2)
  autofill.js               Form auto-fill logic (dev-2)
popup/
  popup.html                Extension popup UI
  popup.css                 Popup styles
  popup.js                  Popup entry point
  profile-form.js           Profile form rendering/reading
  ats.js                    ATS scoring panel (dev-2)
  autofill-trigger.js       Fill button handler (dev-2)
lib/
  schema.js                 Shared data types and constants
  storage.js                chrome.storage.local helpers
  pdf-extract.js            PDF text extraction via pdf.js
  pdfjs/                    Vendored pdf.js (legacy build)
icons/
  icon16.png, icon32.png, icon48.png, icon128.png
```

## Permissions

- `storage` — save profile data locally
- `activeTab` — access the current tab for form filling
- `scripting` — inject content scripts on demand
- `host_permissions: <all_urls>` — needed for form filling on any job site
