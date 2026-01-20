
export enum CalculatorMode {
  STANDARD = 'STANDARD',
  SMART = 'SMART'
}

export interface CalculationHistory {
  expression: string;
  result: string;
  timestamp: number;
  explanation?: string;
}

export type Operation = '+' | '-' | '*' | '/' | '%' | null;
