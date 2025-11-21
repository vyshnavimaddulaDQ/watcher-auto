import 'dotenv/config';

if (!process.env.AXE_PASSWORD) {
  throw new Error('AXE_PASSWORD is not set');
}

interface Credentials {
  username: string;
  password: string;
  enterprise: boolean;
}

export const admin: Credentials = {
  username: 'vyshnavi.maddula+qauser@deque.com',
  password: process.env.AXE_PASSWORD,
  enterprise: true
};

export const enterprise: Credentials = {
  username: 'gayathri.tungala+padma_automation_ent@deque.com',
  password: process.env.AXE_PASSWORD,
  enterprise: true
};
