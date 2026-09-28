import { emptyProfile } from '../lib/schema.js';

export function renderProfileForm(container, profile) {
  container.innerHTML = '';

  const fields = [
    { label: 'First Name', key: 'firstName', type: 'text' },
    { label: 'Last Name', key: 'lastName', type: 'text' },
    { label: 'Summary', key: 'summary', type: 'textarea' },
  ];

  const contactFields = [
    { label: 'Email', key: 'contact.email', type: 'email' },
    { label: 'Phone', key: 'contact.phone', type: 'tel' },
    { label: 'Location', key: 'contact.location', type: 'text' },
    { label: 'LinkedIn', key: 'contact.linkedin', type: 'url' },
    { label: 'Website', key: 'contact.website', type: 'url' },
  ];

  const form = document.createElement('div');
  form.className = 'profile-form';

  // Render basic fields
  for (const f of fields) {
    form.appendChild(createField(f, profile));
  }

  // Contact section
  const contactSection = document.createElement('div');
  contactSection.className = 'form-section';
  const contactTitle = document.createElement('h3');
  contactTitle.textContent = 'Contact';
  contactSection.appendChild(contactTitle);
  for (const f of contactFields) {
    contactSection.appendChild(createField(f, profile));
  }
  form.appendChild(contactSection);

  // Skills
  const skillsSection = document.createElement('div');
  skillsSection.className = 'form-section';
  const skillsTitle = document.createElement('h3');
  skillsTitle.textContent = 'Skills';
  const skillsInput = document.createElement('textarea');
  skillsInput.className = 'form-input';
  skillsInput.id = 'field-skills';
  skillsInput.placeholder = 'JavaScript, React, Node.js, Python...';
  skillsInput.rows = 3;
  skillsInput.value = (profile.skills || []).join(', ');
  skillsSection.appendChild(skillsTitle);
  skillsSection.appendChild(skillsInput);
  form.appendChild(skillsSection);

  container.appendChild(form);
}

function createField({ label, key, type }, profile) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';

  const lbl = document.createElement('label');
  lbl.htmlFor = `field-${key.replace('.', '-')}`;
  lbl.textContent = label;
  wrapper.appendChild(lbl);

  const value = getNestedValue(profile, key) || '';

  if (type === 'textarea') {
    const el = document.createElement('textarea');
    el.className = 'form-input';
    el.id = `field-${key.replace('.', '-')}`;
    el.rows = 3;
    el.value = value;
    wrapper.appendChild(el);
  } else {
    const el = document.createElement('input');
    el.className = 'form-input';
    el.id = `field-${key.replace('.', '-')}`;
    el.type = type;
    el.value = value;
    wrapper.appendChild(el);
  }

  return wrapper;
}

export function readProfileForm(profile) {
  const updated = JSON.parse(JSON.stringify(profile));

  updated.firstName = getInputValue('field-firstName');
  updated.lastName = getInputValue('field-lastName');
  updated.summary = getInputValue('field-summary');
  updated.contact.email = getInputValue('field-contact-email');
  updated.contact.phone = getInputValue('field-contact-phone');
  updated.contact.location = getInputValue('field-contact-location');
  updated.contact.linkedin = getInputValue('field-contact-linkedin');
  updated.contact.website = getInputValue('field-contact-website');

  const skillsRaw = getInputValue('field-skills');
  updated.skills = skillsRaw.split(',').map(s => s.trim()).filter(Boolean);

  return updated;
}

function getInputValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o ? o[k] : ''), obj);
}
