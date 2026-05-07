export type CardData = {
  id: string;
  title: string;
  description: string;
};

export type ColumnData = {
  id: string;
  title: string;
  cardIds: string[];
};

export type BoardData = {
  columns: Record<string, ColumnData>;
  cards: Record<string, CardData>;
  columnOrder: string[];
};

export type ApiKind = 'drag-drop' | 'mutation' | 'intersection';

export type LogEvent = {
  id: string;
  api: ApiKind;
  message: string;
  timestamp: number;
};
