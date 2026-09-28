(function() {
  'use strict';

  var PROFILE_KEY = 'profile';

  function resolveValue(profile, key) {
    if (!profile) return null;
    switch (key) {
      case 'firstName': return profile.firstName || null;
      case 'lastName': return profile.lastName || null;
      case 'fullName': return [profile.firstName, profile.lastName].filter(Boolean).join(' ') || null;
      case 'summary': return profile.summary || null;
      case 'skills': return (profile.skills || []).join(', ') || null;
      case 'contact.email': return (profile.contact && profile.contact.email) || null;
      case 'contact.phone': return (profile.contact && profile.contact.phone) || null;
      case 'contact.location': return (profile.contact && profile.contact.location) || null;
      case 'contact.linkedin': return (profile.contact && profile.contact.linkedin) || null;
      case 'contact.website': return (profile.contact && profile.contact.website) || null;
      default: return null;
    }
  }

  function fillElement(el, value) {
    if (value === null || value === undefined) return false;

    var tagName = (el.tagName || '').toUpperCase();

    if (tagName === 'SELECT') {
      var optionSet = false;
      for (var i = 0; i < el.options.length; i++) {
        var opt = el.options[i];
        if (opt.value.toLowerCase() === value.toLowerCase() ||
            opt.text.toLowerCase() === value.toLowerCase()) {
          el.selectedIndex = i;
          optionSet = true;
          break;
        }
      }
      if (!optionSet) return false;
    } else {
      el.value = value;
    }

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function doFill(profile) {
    var matcher = window.__fieldMatcher;
    if (!matcher) return { filledCount: 0, skippedCount: 0 };

    var elements = document.querySelectorAll('input, textarea, select');
    var filledCount = 0;
    var skippedCount = 0;

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = matcher.guessFieldKey(el);
      if (!key) { skippedCount++; continue; }

      var value = resolveValue(profile, key);
      if (!value) { skippedCount++; continue; }

      var filled = fillElement(el, value);
      if (filled) { filledCount++; } else { skippedCount++; }
    }

    return { filledCount: filledCount, skippedCount: skippedCount };
  }

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type !== 'FILL_FORM') return false;

    chrome.storage.local.get([PROFILE_KEY], function(result) {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }

      var profile = result[PROFILE_KEY];
      if (!profile || !profile.firstName && !profile.contact) {
        sendResponse({ ok: true, filledCount: 0, skippedCount: 0 });
        return;
      }

      try {
        var counts = doFill(profile);
        sendResponse({ ok: true, filledCount: counts.filledCount, skippedCount: counts.skippedCount });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    });

    return true; // Keep channel open for async sendResponse
  });

})();
