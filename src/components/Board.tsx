import { useCallback, useState } from 'react';
import styles from './Board.module.css';
import type { BoardData } from '../types';
import { initialBoard } from '../data/initialBoard';
import { Column } from './Column';
import { useEventLog } from '../context/EventLogContext';
import { useMutationObserver } from '../hooks/useMutationObserver';

export function Board() {
  const { log } = useEventLog();
  const [board, setBoard] = useState<BoardData>(initialBoard);
  const [boardEl, setBoardEl] = useState<HTMLDivElement | null>(null);

  const handleMutations = useCallback<MutationCallback>(
    (records) => {
      for (const record of records) {
        if (record.type !== 'childList') continue;
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.dataset.cardId) {
            const target = record.target as HTMLElement;
            log(
              'mutation',
              `addedNode → card ${node.dataset.cardId} into ${target.dataset.listFor ?? 'unknown'}`,
            );
          }
        });
        record.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.dataset.cardId) {
            const target = record.target as HTMLElement;
            log(
              'mutation',
              `removedNode → card ${node.dataset.cardId} from ${target.dataset.listFor ?? 'unknown'}`,
            );
          }
        });
      }
    },
    [log],
  );

  useMutationObserver(boardEl, handleMutations);

  function handleDropCard(
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
  ) {
    setBoard((prev) => {
      const fromCol = prev.columns[fromColumnId];
      const toCol = prev.columns[toColumnId];
      if (!fromCol || !toCol) return prev;
      return {
        ...prev,
        columns: {
          ...prev.columns,
          [fromColumnId]: {
            ...fromCol,
            cardIds: fromCol.cardIds.filter((id) => id !== cardId),
          },
          [toColumnId]: {
            ...toCol,
            cardIds: [...toCol.cardIds, cardId],
          },
        },
      };
    });
  }

  return (
    <div ref={setBoardEl} className={styles.board} data-board-root>
      {board.columnOrder.map((columnId) => {
        const column = board.columns[columnId];
        const cards = column.cardIds.map((id) => board.cards[id]);
        return (
          <Column
            key={column.id}
            column={column}
            cards={cards}
            onDropCard={handleDropCard}
          />
        );
      })}
    </div>
  );
}
