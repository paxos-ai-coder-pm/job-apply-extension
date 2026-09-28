export const PROFILE_KEY = 'profile';
export const RESUME_TEXT_KEY = 'resumeText';
export const ATS_LAST_KEY = 'atsLast';
export const SCHEMA_VERSION = 1;

export function emptyProfile() {
  return {
    schemaVersion: SCHEMA_VERSION,
    firstName: '',
    lastName: '',
    contact: { email: '', phone: '', location: '', linkedin: '', website: '' },
    experience: [],
    education: [],
    skills: [],
    summary: ''
  };
}

/**
 * @typedef {Object} ProfileContact
 * @property {string} email
 * @property {string} phone
 * @property {string} location
 * @property {string} linkedin
 * @property {string} website
 *
 * @typedef {Object} ProfileExperienceItem
 * @property {string} company
 * @property {string} title
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} description
 *
 * @typedef {Object} ProfileEducationItem
 * @property {string} school
 * @property {string} degree
 * @property {string} field
 * @property {string} startDate
 * @property {string} endDate
 *
 * @typedef {Object} Profile
 * @property {number} schemaVersion
 * @property {string} firstName
 * @property {string} lastName
 * @property {ProfileContact} contact
 * @property {ProfileExperienceItem[]} experience
 * @property {ProfileEducationItem[]} education
 * @property {string[]} skills
 * @property {string} summary
 *
 * @typedef {Object} AtsResult
 * @property {number} score
 * @property {string[]} matched
 * @property {string[]} missing
 * @property {Array<{keyword: string, suggestion: string}>} suggestions
 * @property {number} generatedAt
 */
