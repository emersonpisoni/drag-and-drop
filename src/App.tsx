import styles from './App.module.css';
import { Board } from './components/Board';
import { InfoPanel } from './components/InfoPanel';
import { EventLog } from './components/EventLog';
import { EventLogProvider } from './context/EventLogContext';

export default function App() {
  return (
    <EventLogProvider>
      <div className={styles.shell}>
        <header className={styles.topBar}>
          <h1 className={styles.title}>
            Drag & Drop · Mutation · Intersection
          </h1>
          <p className={styles.tagline}>
            A small POC showing three browser APIs working together — and why
            each of them exists.
          </p>
        </header>
        <main className={styles.main}>
          <section className={styles.boardPane}>
            <Board />
          </section>
          <aside className={styles.sidePane}>
            <InfoPanel />
            <EventLog />
          </aside>
        </main>
      </div>
    </EventLogProvider>
  );
}
