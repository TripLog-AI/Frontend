import api, { tokenStorage } from './index.js';

export async function signup({ email, password, nickname }) {
  const { data } = await api.post('/auth/signup', { email, password, nickname });
  return data;
}

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  if (data?.accessToken) {
    tokenStorage.set(data.accessToken);
  }
  return data;
}

export function logout() {
  tokenStorage.clear();
  window.location.href = '/login';
}
