import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ApiKind, LogEvent } from '../types';

const MAX_EVENTS = 60;

type EventLogContextValue = {
  events: LogEvent[];
  log: (api: ApiKind, message: string) => void;
  clear: () => void;
};

const EventLogContext = createContext<EventLogContextValue | null>(null);

export function EventLogProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<LogEvent[]>([]);

  const log = useCallback((api: ApiKind, message: string) => {
    setEvents((prev) => {
      const next: LogEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        api,
        message,
        timestamp: Date.now(),
      };
      return [next, ...prev].slice(0, MAX_EVENTS);
    });
  }, []);

  const clear = useCallback(() => setEvents([]), []);

  const value = useMemo(() => ({ events, log, clear }), [events, log, clear]);

  return (
    <EventLogContext.Provider value={value}>
      {children}
    </EventLogContext.Provider>
  );
}

export function useEventLog() {
  const ctx = useContext(EventLogContext);
  if (!ctx) {
    throw new Error('useEventLog must be used inside <EventLogProvider>');
  }
  return ctx;
}
