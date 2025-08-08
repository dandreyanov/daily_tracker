// src/api.ts

import { Column } from './types';
const STORAGE_KEY = 'tasktracker-board';

export async function load(): Promise<Column[]> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  return [
    { id: 'urgent',    title: 'Важно и срочно',    tasks: [] },
    { id: 'important', title: 'Важно, но не срочно', tasks: [] },
    { id: 'today',     title: 'Не важно, но срочно', tasks: [] },
    { id: 'notimp',    title: 'Не важно и не срочно', tasks: [] },
    { id: 'day',       title: 'В плане на сегодня',  tasks: [] },
    { id: 'me',        title: 'Я',                   tasks: [] },
    { id: 'home',      title: 'Домашние дела',       tasks: [] },
    { id: 'family',    title: 'Семья',               tasks: [] },
    { id: 'ideal',     title: 'Идеальный день',      tasks: [] },
    { id: 'holidays',  title: 'Праздники',           tasks: [] },
  ];
}

export async function save(cols: Column[]): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
}
