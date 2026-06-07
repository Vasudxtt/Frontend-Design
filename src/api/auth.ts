import { api } from './axios';
import type { AuthResponse } from '../types';

export async function login(username: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout').catch(() => {});
}
