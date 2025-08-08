// src/main.ts

import { load, save } from './api';
import { Column, Task } from './types';
import { createElem, promptTask } from './utils';
import { initDnd } from './dnd';

async function renderBoard() {
  const board = document.getElementById('board')!;
  board.innerHTML = '';

  // Загружаем данные из localStorage
  const cols = await load();

  // Порядок инициализации сетки
  const kanbanOrder = ['urgent', 'important', 'today', 'notimp'];
  const checklists = cols.filter(c => !kanbanOrder.includes(c.id));
  const totalCols = 2 + checklists.length;

  const grid = createElem('div', ['board-grid']);
  Object.assign(grid.style, {
    display: 'grid',
    gridTemplateColumns: `repeat(${totalCols}, 1fr)`,
    gridTemplateRows: 'auto auto',
    gap: '16px',
  });
  board.append(grid);

  // Рендер 4-х канбана
  kanbanOrder.forEach((id, idx) => {
    const col = cols.find(c => c.id === id)!;
    const cell = renderColumn(col, cols);
    const row = idx < 2 ? 1 : 2;
    const colStart = (idx % 2) + 1;
    Object.assign(cell.style, { gridRow: `${row}`, gridColumn: `${colStart}` });
    grid.append(cell);
  });

  // Рендер чек-листов (растягиваем на 2 строки)
  checklists.forEach((col, i) => {
    const cell = renderColumn(col, cols);
    Object.assign(cell.style, {
      gridRow: '1 / span 2',
      gridColumn: `${3 + i}`,
    });
    grid.append(cell);
  });

  initDnd(cols, async newCols => {
    // Сохраняем в localStorage и перерисовываем
    await save(newCols);
    renderBoard();
  });
}

function renderColumn(col: Column, allCols: Column[]): HTMLElement {
  const checklistIds = ['me','home','family','ideal','holidays'];
  const colDiv = createElem('div', ['column']);
  colDiv.id = `col-${col.id}`;
  colDiv.classList.add(`column--${col.id}`);

  const title = createElem('h3', [], col.title);
  colDiv.append(title);

  const ul = createElem('ul', ['task-list']) as HTMLUListElement;
  col.tasks.forEach((task: Task) => {
    const li = createElem('li', [], '') as HTMLLIElement;
    li.setAttribute('data-id', task.id);
    li.classList.toggle('checked', task.done);
    li.style.position = 'relative';

    const textSpan = createElem('span', [], task.text);
    textSpan.style.flex = '1';
    if (checklistIds.includes(col.id)) {
      textSpan.addEventListener('click', () => {
        task.done = !task.done;
        col.tasks.sort((a, b) => Number(a.done) - Number(b.done));
        save(allCols);
        renderBoard();
      });
    }
    li.append(textSpan);

    const delBtn = createElem('button', ['delete-btn'], '×');
    delBtn.addEventListener('click', e => {
      e.stopPropagation();
      const arr = allCols.find(c => c.id === col.id)!.tasks;
      const idx = arr.findIndex(t => t.id === task.id);
      arr.splice(idx, 1);
      save(allCols);
      renderBoard();
    });
    li.append(delBtn);

    ul.append(li);
  });
  colDiv.append(ul);

  const btn = createElem('button', [], 'Добавить');
  btn.addEventListener('click', async () => {
    const newTask = await promptTask();
    if (!newTask) return;
    col.tasks.push(newTask);
    await save(allCols);
    renderBoard();
  });
  colDiv.append(btn);

  return colDiv;
}

// Запускаем отрисовку сразу
renderBoard();
