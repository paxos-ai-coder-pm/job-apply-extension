import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// We test the guessFieldKey logic directly by reimplementing the matcher
// (the actual file uses window globals for browser compat)
const FIELD_MAP = [
  { pattern: /\bemail\b/i, key: 'contact.email' },
  { pattern: /\bphone\b|\btel\b|\bmobile\b|\bcell\b/i, key: 'contact.phone' },
  { pattern: /\bfirst[\s_-]?name\b|\bgiven[\s_-]?name\b|\bfname\b/i, key: 'firstName' },
  { pattern: /\blast[\s_-]?name\b|\bsurname\b|\bfamily[\s_-]?name\b|\blname\b/i, key: 'lastName' },
  { pattern: /\bfull[\s_-]?name\b|\byour[\s_-]?name\b|\bname\b/i, key: 'fullName' },
  { pattern: /\bcity\b|\blocation\b|\baddress\b/i, key: 'contact.location' },
  { pattern: /\blinkedin\b/i, key: 'contact.linkedin' },
  { pattern: /\bwebsite\b|\bportfolio\b|\bpersonal[\s_-]?url\b/i, key: 'contact.website' },
  { pattern: /\bsummary\b|\babout\b|\bbio\b/i, key: 'summary' },
  { pattern: /\bskills\b/i, key: 'skills' },
];

const SKIP_TYPES = new Set(['password', 'file', 'hidden', 'submit', 'button', 'reset', 'image', 'checkbox', 'radio']);

function guessFieldKey(el) {
  if (!el) return null;
  const tagName = (el.tagName || '').toUpperCase();
  if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) return null;
  const type = (el.type || '').toLowerCase();
  if (SKIP_TYPES.has(type)) return null;
  if (el.disabled || el.readOnly) return null;

  const hints = [el.name || '', el.id || '', el.autocomplete || '', el.placeholder || ''].join(' ');
  for (const { pattern, key } of FIELD_MAP) {
    if (pattern.test(hints)) return key;
  }
  return null;
}

function mockInput(overrides = {}) {
  return { tagName: 'INPUT', type: 'text', name: '', id: '', placeholder: '', autocomplete: '', disabled: false, readOnly: false, ...overrides };
}

describe('guessFieldKey', () => {
  it('returns contact.email for name=email', () => {
    assert.strictEqual(guessFieldKey(mockInput({ name: 'email' })), 'contact.email');
  });

  it('returns contact.phone for autocomplete=tel', () => {
    assert.strictEqual(guessFieldKey(mockInput({ autocomplete: 'tel' })), 'contact.phone');
  });

  it('returns firstName for name=first_name', () => {
    assert.strictEqual(guessFieldKey(mockInput({ name: 'first_name' })), 'firstName');
  });

  it('returns lastName for id=lname', () => {
    assert.strictEqual(guessFieldKey(mockInput({ id: 'lname' })), 'lastName');
  });

  it('returns null for type=password', () => {
    assert.strictEqual(guessFieldKey(mockInput({ type: 'password', name: 'email' })), null);
  });

  it('returns null for disabled input', () => {
    assert.strictEqual(guessFieldKey(mockInput({ name: 'email', disabled: true })), null);
  });

  it('returns summary for name=summary', () => {
    assert.strictEqual(guessFieldKey(mockInput({ tagName: 'TEXTAREA', name: 'summary' })), 'summary');
  });

  it('returns contact.linkedin for placeholder containing linkedin', () => {
    assert.strictEqual(guessFieldKey(mockInput({ placeholder: 'Your LinkedIn URL' })), 'contact.linkedin');
  });

  it('returns null for unrecognized field', () => {
    assert.strictEqual(guessFieldKey(mockInput({ name: 'captcha_answer' })), null);
  });

  it('returns null for type=hidden', () => {
    assert.strictEqual(guessFieldKey(mockInput({ type: 'hidden', name: 'email' })), null);
  });
});
