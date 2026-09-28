import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, extractKeywords, scoreResume } from './ats-engine.js';

describe('tokenize', () => {
  it('lowercases and strips punctuation', () => {
    const result = tokenize('React, TypeScript!');
    assert.ok(result.includes('react'));
    assert.ok(result.includes('typescript'));
  });

  it('removes stopwords', () => {
    const result = tokenize('the and or of');
    assert.deepStrictEqual(result, []);
  });
});

describe('extractKeywords', () => {
  it('returns empty for empty input', () => {
    assert.deepStrictEqual(extractKeywords(''), []);
  });

  it('returns empty for stopword-only input', () => {
    const result = extractKeywords('the and or of in on at to for');
    assert.deepStrictEqual(result, []);
  });

  it('extracts meaningful keywords', () => {
    const kws = extractKeywords('We need React TypeScript Node.js experience. React and TypeScript required.');
    assert.ok(kws.includes('react'));
    assert.ok(kws.includes('typescript'));
  });

  it('respects maxKeywords cap', () => {
    const jd = Array.from({ length: 100 }, (_, i) => `skill${i}`).join(' ');
    const kws = extractKeywords(jd, 10);
    assert.ok(kws.length <= 10);
  });
});

describe('scoreResume', () => {
  it('returns score 0 for empty JD', () => {
    const result = scoreResume({ resumeText: 'React developer', profile: {}, jobDescription: '' });
    assert.strictEqual(result.score, 0);
    assert.deepStrictEqual(result.matched, []);
    assert.deepStrictEqual(result.missing, []);
  });

  it('returns score 0 for stopword-only JD', () => {
    const result = scoreResume({ resumeText: 'React developer', profile: {}, jobDescription: 'the and or of' });
    assert.strictEqual(result.score, 0);
  });

  it('scores partial match correctly', () => {
    const jd = 'Looking for React TypeScript Node.js developer with 5 years experience';
    const resume = 'Experienced React and Node.js developer';
    const result = scoreResume({ resumeText: resume, profile: { skills: [], experience: [], education: [] }, jobDescription: jd });
    assert.ok(result.matched.includes('react'));
    assert.ok(result.matched.includes('node.js'));
    assert.ok(result.missing.includes('typescript'));
    assert.ok(result.score > 0 && result.score < 100);
  });

  it('scores full match as 100', () => {
    const jd = 'Need React developer';
    const resume = 'React developer with experience';
    const result = scoreResume({ resumeText: resume, profile: { skills: [], experience: [], education: [] }, jobDescription: jd });
    assert.strictEqual(result.score, 100);
  });

  it('caps suggestions at 8', () => {
    const jd = Array.from({ length: 30 }, (_, i) => `skill${i} `).join('');
    const result = scoreResume({ resumeText: '', profile: { skills: [], experience: [], education: [] }, jobDescription: jd });
    assert.ok(result.suggestions.length <= 8);
  });

  it('is pure — same inputs same outputs', () => {
    const params = { resumeText: 'React developer', profile: { skills: ['react'], experience: [], education: [] }, jobDescription: 'Need React TypeScript developer' };
    const r1 = scoreResume(params);
    const r2 = scoreResume(params);
    assert.deepStrictEqual(r1.score, r2.score);
    assert.deepStrictEqual(r1.matched, r2.matched);
    assert.deepStrictEqual(r1.missing, r2.missing);
  });

  it('does not throw on missing profile fields', () => {
    assert.doesNotThrow(() => scoreResume({ jobDescription: 'React developer needed' }));
  });
});
