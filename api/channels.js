const site = require('./content/site.json');

function meetingChannels(record) {
  const text = [
    'Site visit request for Vakratund Construction',
    `Name: ${record.name}`,
    `Phone: ${record.phone}`,
    record.email ? `Email: ${record.email}` : '',
    `When: ${record.when}`,
    `Work: ${record.topic}`,
    record.place ? `Place: ${record.place}` : '',
    record.note ? record.note : '',
  ]
    .filter(Boolean)
    .join('\n');
  const subject = `Site visit: ${record.name}`;
  return {
    whatsapp: `https://wa.me/${site.phoneWa}?text=${encodeURIComponent(text)}`,
    email: `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
    notify: {
      title: 'Vakratund — visit noted',
      body: `${record.topic} · ${record.when}`,
    },
  };
}

module.exports = { meetingChannels, site };
