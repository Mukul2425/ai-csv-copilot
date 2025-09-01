
export type CsvRow = Record<string, string | number>;

export interface CsvData {
  headers: string[];
  data: CsvRow[];
}

export type ChartType = 'bar' | 'line' | 'scatter';

export interface ChartData {
  type: ChartType;
  data: any[];
  xKey: string;
  yKey: string;
  zKey?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  chart?: ChartData;
}

export interface GeminiResponse {
  insight: string;
  chart: ChartData | null;
}
