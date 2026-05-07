import type { BoardData } from '../types';

const cardSeeds: Array<{ title: string; description: string }> = [
  { title: 'Read the spec', description: 'HTML Living Standard — drag and drop section.' },
  { title: 'Sketch the kanban', description: 'Three columns is enough for a POC.' },
  { title: 'Wire dragstart', description: 'Set dataTransfer payload to the card id.' },
  { title: 'Wire dragover', description: 'Remember: preventDefault enables drop.' },
  { title: 'Handle drop', description: 'Move card in state, then let React render.' },
  { title: 'Observe DOM mutations', description: 'Detect any change, even outside React.' },
  { title: 'Detect viewport entry', description: 'Replace scroll listeners with one observer.' },
  { title: 'Lazy load images', description: 'Built-in via <img loading="lazy"> nowadays.' },
  { title: 'Compare with mouse events', description: 'Why HTML5 drag-drop saved hours of code.' },
  { title: 'Why Mutation Events died', description: 'They were synchronous and slow.' },
  { title: 'Throttle vs IntersectionObserver', description: 'Async beats throttled scroll handlers.' },
  { title: 'Touch support gap', description: 'Native drag-drop ignores touch events.' },
  { title: 'dnd-kit alternative', description: 'Pointer Events under the hood.' },
  { title: 'MutationRecord shape', description: 'addedNodes, removedNodes, attributeName...' },
  { title: 'IntersectionObserverEntry', description: 'isIntersecting, intersectionRatio, time.' },
  { title: 'rootMargin trick', description: 'Use negative margins to fire before edge.' },
  { title: 'threshold array', description: 'Pass [0, 0.25, 0.5, 0.75, 1] for granular events.' },
  { title: 'Disconnect on unmount', description: 'Always cleanup to avoid memory leaks.' },
  { title: 'subtree: true', description: 'Watches descendants too, careful with cost.' },
  { title: 'attributeFilter', description: 'Limit attribute-watch to specific names.' },
];

const todoIds = cardSeeds.slice(0, 8).map((_, i) => `card-${i + 1}`);
const doingIds = cardSeeds.slice(8, 14).map((_, i) => `card-${i + 9}`);
const doneIds = cardSeeds.slice(14).map((_, i) => `card-${i + 15}`);

const cards: BoardData['cards'] = Object.fromEntries(
  cardSeeds.map((seed, i) => [
    `card-${i + 1}`,
    { id: `card-${i + 1}`, title: seed.title, description: seed.description },
  ]),
);

export const initialBoard: BoardData = {
  cards,
  columns: {
    'col-todo': { id: 'col-todo', title: 'To do', cardIds: todoIds },
    'col-doing': { id: 'col-doing', title: 'In progress', cardIds: doingIds },
    'col-done': { id: 'col-done', title: 'Done', cardIds: doneIds },
  },
  columnOrder: ['col-todo', 'col-doing', 'col-done'],
};
