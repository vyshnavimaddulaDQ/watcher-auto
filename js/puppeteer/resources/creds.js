require('dotenv/config');

if (!process.env.AXE_PASSWORD) {
  throw new Error('AXE_PASSWORD is not set');
}

const admin = {
  username: 'vyshnavi.maddula+qauser@deque.com',
  password: process.env.AXE_PASSWORD,
  enterprise: true
};

const enterprise = {
  username: 'gayathri.tungala+padma_automation_ent@deque.com',
  password: process.env.AXE_PASSWORD,
  enterprise: true
};

module.exports = {
  admin,
  enterprise
};

