const STOPWORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
  'from','as','is','was','are','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','shall',
  'that','this','these','those','it','its','i','you','he','she','we','they',
  'their','our','your','his','her','not','no','nor','so','yet','both','either',
  'whether','while','although','because','if','then','than','when','where','who',
  'which','what','how','all','each','every','few','more','most','other','some',
  'such','into','through','during','before','after','above','below','between',
  'out','off','over','under','again','further','once','here','there','only',
  'own','same','too','very','just','also','can','about','up','per','etc',
  'need','needs','needed','looking','seek','seeking','want','wants','join',
  'work','working','years','year','strong','good','great','excellent','ability',
  'able','well','new','like','use','using','used','make','making','get','getting',
  'take','taking','help','helping','build','building','team','role','position'
]);

export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

export function extractKeywords(jdText, maxKeywords = 40) {
  if (!jdText || !jdText.trim()) return [];

  const tokens = tokenize(jdText);
  if (tokens.length === 0) return [];

  // Frequency count for unigrams
  const freq = new Map();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }

  // Bigrams (2-word phrases)
  const words = jdText.toLowerCase().replace(/[^a-z0-9\s+#.]/g, ' ').split(/\s+/).filter(w => w.length > 0);
  const bigrams = new Map();
  for (let i = 0; i < words.length - 1; i++) {
    if (STOPWORDS.has(words[i]) || STOPWORDS.has(words[i + 1])) continue;
    const bg = `${words[i]} ${words[i + 1]}`;
    bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
  }

  // Combine: unigrams with freq >= 1, bigrams with freq >= 2
  const candidates = [];
  for (const [word, count] of freq) {
    if (!STOPWORDS.has(word)) candidates.push({ keyword: word, count });
  }
  for (const [phrase, count] of bigrams) {
    if (count >= 2) candidates.push({ keyword: phrase, count });
  }

  // Sort by frequency descending, deduplicate
  candidates.sort((a, b) => b.count - a.count);

  const seen = new Set();
  const result = [];
  for (const { keyword } of candidates) {
    if (!seen.has(keyword) && result.length < maxKeywords) {
      seen.add(keyword);
      result.push(keyword);
    }
  }
  return result;
}

export function scoreResume({ resumeText = '', profile = {}, jobDescription = '' }) {
  if (!jobDescription || !jobDescription.trim()) {
    return { score: 0, matched: [], missing: [], suggestions: [], generatedAt: Date.now() };
  }

  const keywords = extractKeywords(jobDescription);
  if (keywords.length === 0) {
    return { score: 0, matched: [], missing: [], suggestions: [], generatedAt: Date.now() };
  }

  // Build corpus from all resume/profile text
  const experienceText = (profile.experience || []).map(e => `${e.title || ''} ${e.description || ''}`).join(' ');
  const educationText = (profile.education || []).map(e => `${e.degree || ''} ${e.field || ''}`).join(' ');
  const corpus = [
    resumeText,
    (profile.skills || []).join(' '),
    experienceText,
    educationText,
    profile.summary || '',
    profile.firstName || '',
    profile.lastName || ''
  ].join(' ').toLowerCase();

  const matched = [];
  const missing = [];

  for (const kw of keywords) {
    if (corpus.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const score = keywords.length > 0 ? Math.round((matched.length / keywords.length) * 100) : 0;

  const suggestions = missing.slice(0, 8).map(keyword => ({
    keyword,
    suggestion: `Add "${keyword}" — e.g. "Applied ${keyword} to deliver measurable results"`
  }));

  return { score, matched, missing, suggestions, generatedAt: Date.now() };
}
