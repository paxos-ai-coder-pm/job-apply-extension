(function() {
  'use strict';

  var FIELD_MAP = [
    { pattern: /\bemail\b/i, key: 'contact.email' },
    { pattern: /\bphone\b|\btel\b|\bmobile\b|\bcell\b/i, key: 'contact.phone' },
    { pattern: /\bfirst[\s_-]?name\b|\bgiven[\s_-]?name\b|\bfname\b/i, key: 'firstName' },
    { pattern: /\blast[\s_-]?name\b|\bsurname\b|\bfamily[\s_-]?name\b|\blname\b/i, key: 'lastName' },
    { pattern: /\bfull[\s_-]?name\b|\byour[\s_-]?name\b|\bname\b/i, key: 'fullName' },
    { pattern: /\bcity\b|\blocation\b|\baddress\b/i, key: 'contact.location' },
    { pattern: /\blinkedin\b/i, key: 'contact.linkedin' },
    { pattern: /\bwebsite\b|\bportfolio\b|\bpersonal[\s_-]?url\b/i, key: 'contact.website' },
    { pattern: /\bsummary\b|\babout\b|\bbio\b|\bprofessional[\s_-]?summary\b/i, key: 'summary' },
    { pattern: /\bskills\b/i, key: 'skills' },
  ];

  var SKIP_TYPES = new Set(['password', 'file', 'hidden', 'submit', 'button', 'reset', 'image', 'checkbox', 'radio']);

  function guessFieldKey(el) {
    if (!el) return null;

    var tagName = (el.tagName || '').toUpperCase();
    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && tagName !== 'SELECT') return null;

    var type = (el.type || '').toLowerCase();
    if (SKIP_TYPES.has(type)) return null;
    if (el.disabled || el.readOnly) return null;

    var hints = [
      el.name || '',
      el.id || '',
      el.getAttribute('autocomplete') || '',
      el.placeholder || '',
      el.getAttribute('aria-label') || '',
      getLabelText(el),
    ].join(' ');

    for (var i = 0; i < FIELD_MAP.length; i++) {
      if (FIELD_MAP[i].pattern.test(hints)) {
        return FIELD_MAP[i].key;
      }
    }

    return null;
  }

  function getLabelText(el) {
    if (!el.id) return '';
    var labels = document.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].htmlFor === el.id) return labels[i].textContent;
    }
    return '';
  }

  // Expose globally for autofill.js to use
  window.__fieldMatcher = { guessFieldKey: guessFieldKey };

})();
