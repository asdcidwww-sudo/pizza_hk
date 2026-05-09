
export enum GameLevel {
  BASIC = 1,
  EQUIVALENT = 2,
  COMPARISON = 3
}

export interface Fraction {
  numerator: number;
  denominator: number;
}

export interface Order {
  id: string;
  target: Fraction;
  comparisonTarget?: Fraction; // Used for Level 3
  level: GameLevel;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ChatMessage {
  role: 'coach' | 'student';
  content: string;
}
