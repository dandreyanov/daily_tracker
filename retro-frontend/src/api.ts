// frontend/api.ts
import { Column } from './types';

let token: string | null = null;

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  token = data.token;
}

export async function load(): Promise<Column[]> {
  if (!token) throw new Error('No auth token');
  const res = await fetch('/api/board', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load board');
  return res.json();
}

export async function save(cols: Column[]): Promise<void> {
  if (!token) throw new Error('No auth token');
  const res = await fetch('/api/board', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cols),
  });
  if (!res.ok) throw new Error('Failed to save board');
}
