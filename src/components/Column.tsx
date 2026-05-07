import { useState, type DragEvent } from 'react';
import styles from './Column.module.css';
import type { CardData, ColumnData } from '../types';
import { Card } from './Card';
import { useEventLog } from '../context/EventLogContext';

type ColumnProps = {
  column: ColumnData;
  cards: CardData[];
  onDropCard: (cardId: string, fromColumnId: string, toColumnId: string) => void;
};

export function Column({ column, cards, onDropCard }: ColumnProps) {
  const { log } = useEventLog();
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) {
      setIsDragOver(true);
    }
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const cardId = e.dataTransfer.getData('text/plain');
    const fromColumnId = e.dataTransfer.getData('application/x-source-column');
    if (!cardId || !fromColumnId) return;
    log(
      'drag-drop',
      `drop → card ${cardId} from ${fromColumnId} into ${column.id}`,
    );
    if (fromColumnId !== column.id) {
      onDropCard(cardId, fromColumnId, column.id);
    }
  }

  return (
    <div
      className={`${styles.column} ${isDragOver ? styles.dragOver : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-column-id={column.id}
    >
      <header className={styles.header}>
        <h2 className={styles.title}>{column.title}</h2>
        <span className={styles.count}>{cards.length}</span>
      </header>
      <div className={styles.list} data-list-for={column.id}>
        {cards.map((card) => (
          <Card key={card.id} card={card} columnId={column.id} />
        ))}
        {cards.length === 0 && (
          <div className={styles.empty}>Drop a card here</div>
        )}
      </div>
    </div>
  );
}
