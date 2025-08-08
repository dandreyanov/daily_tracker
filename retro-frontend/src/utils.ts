import { Task } from './types';
import { v4 as uuid } from 'uuid';

export function createElem<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  classNames: string[] = [],
  text?: string
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  el.classList.add(...classNames);
  if (text) el.textContent = text;
  return el;
}

export async function promptTask(): Promise<Task | null> {
  const text = window.prompt('Текст задачи/пункта:');
  if (!text) return null;
  return { id: uuid(), text, done: false };
}
