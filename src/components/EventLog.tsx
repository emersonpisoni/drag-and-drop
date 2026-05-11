import styles from './EventLog.module.css';
import { useEventLog } from '../context/EventLogContext';
import type { ApiKind } from '../types';

const API_LABEL: Record<ApiKind, string> = {
  'drag-drop': 'drag',
  mutation: 'mutation',
  intersection: 'intersect',
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
}

export function EventLog() {
  const { events, clear } = useEventLog();

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h3 className={styles.title}>Live event log</h3>
        <button className={styles.clear} onClick={clear} type="button">
          clear
        </button>
      </header>
      <ol className={styles.list}>
        {events.length === 0 && (
          <li className={styles.empty}>
            Interact with the board — events will stream here.
          </li>
        )}
        {events.map((event) => (
          <li key={event.id} className={styles.item}>
            <span className={styles.time}>{formatTime(event.timestamp)}</span>
            <span
              className={`${styles.badge} ${styles[`badge_${event.api}`]}`}
            >
              {API_LABEL[event.api]}
            </span>
            <span className={styles.message}>{event.message}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
