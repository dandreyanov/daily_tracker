// frontend/dnd.ts

import Sortable from 'sortablejs';
import { Column, Task } from './types';
import * as API from './api';

/**
 * Инициализирует drag’n’drop для всех колонок.
 * @param columns Текущее состояние колонок.
 * @param onChange Коллбэк для перерендера после DnD.
 */
export function initDnd(columns: Column[], onChange: (cols: Column[]) => void) {
  columns.forEach(col => {
    const listEl = document
        .getElementById(`col-${col.id}`)!
        .querySelector('ul')!;

    Sortable.create(listEl, {
      group: 'shared',
      animation: 150,
      onEnd: async () => {
        // После завершения перетаскивания собираем новое состояние
        const newState: Column[] = columns.map(c => {
          const ulEl = document
              .getElementById(`col-${c.id}`)!
              .querySelector('ul')!;
          const tasks: Task[] = Array.from(ulEl.children).map(li => {
            const el = li as HTMLElement;
            const id = el.getAttribute('data-id')!;
            const span = el.querySelector('span');
            const text = span?.textContent?.trim() || '';
            const done = el.classList.contains('checked');
            return { id, text, done };
          });
          return { ...c, tasks };
        });
        // Сохраняем на бэке
        await API.save(newState);
        // Перерисовываем доску
        onChange(newState);
      }
    });
  });
}
