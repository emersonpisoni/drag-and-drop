import { useMemo, type DragEvent } from 'react';
import styles from './Card.module.css';
import type { CardData } from '../types';
import { useEventLog } from '../context/EventLogContext';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

type CardProps = {
  card: CardData;
  columnId: string;
};

export function Card({ card, columnId }: CardProps) {
  const { log } = useEventLog();

  const ioOptions = useMemo<IntersectionObserverInit>(
    () => ({ threshold: [0, 0.5, 1] }),
    [],
  );

  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>(
    ioOptions,
    (entry) => {
      log(
        'intersection',
        `Card "${card.title}" — ${entry.isIntersecting ? 'visible' : 'hidden'} (${Math.round(entry.intersectionRatio * 100)}%)`,
      );
    },
  );

  function handleDragStart(e: DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.setData('application/x-source-column', columnId);
    e.dataTransfer.effectAllowed = 'move';
    log('drag-drop', `dragstart → "${card.title}" from ${columnId}`);
  }

  function handleDragEnd(e: DragEvent<HTMLDivElement>) {
    log(
      'drag-drop',
      `dragend → "${card.title}" (dropEffect: ${e.dataTransfer.dropEffect})`,
    );
  }

  return (
    <div
      ref={ref}
      className={`${styles.card} ${isVisible ? styles.visible : styles.hidden}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-card-id={card.id}
    >
      <div className={styles.header}>
        <span className={styles.title}>{card.title}</span>
        <span
          className={styles.dot}
          title={isVisible ? 'in viewport' : 'off viewport'}
          aria-hidden
        />
      </div>
      <p className={styles.description}>{card.description}</p>
    </div>
  );
}
