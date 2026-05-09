
import { Order, GameLevel, Badge } from './types';

export const ORDERS: Order[] = [
  // Level 1: Basic
  { id: '1-1', target: { numerator: 1, denominator: 2 }, level: GameLevel.BASIC },
  { id: '1-2', target: { numerator: 1, denominator: 4 }, level: GameLevel.BASIC },
  { id: '1-3', target: { numerator: 3, denominator: 4 }, level: GameLevel.BASIC },
  { id: '1-4', target: { numerator: 2, denominator: 3 }, level: GameLevel.BASIC },
  // Level 2: Equivalent
  { id: '2-1', target: { numerator: 1, denominator: 2 }, level: GameLevel.EQUIVALENT },
  { id: '2-2', target: { numerator: 2, denominator: 4 }, level: GameLevel.EQUIVALENT },
  { id: '2-3', target: { numerator: 3, denominator: 6 }, level: GameLevel.EQUIVALENT },
  { id: '2-4', target: { numerator: 4, denominator: 8 }, level: GameLevel.EQUIVALENT },
  { id: '2-5', target: { numerator: 1, denominator: 5 }, level: GameLevel.EQUIVALENT },
  // Level 3: Comparison
  { id: '3-1', target: { numerator: 3, denominator: 8 }, comparisonTarget: { numerator: 1, denominator: 2 }, level: GameLevel.COMPARISON },
  { id: '3-2', target: { numerator: 5, denominator: 8 }, comparisonTarget: { numerator: 2, denominator: 3 }, level: GameLevel.COMPARISON },
  { id: '3-3', target: { numerator: 1, denominator: 3 }, comparisonTarget: { numerator: 1, denominator: 4 }, level: GameLevel.COMPARISON },
];

export const BADGES: Badge[] = [
  { id: 'b1', name: '披薩小學徒', description: '識得分數就係部分同整體', icon: '🍕' },
  { id: 'b2', name: '等值達人', description: '知道切法唔同，面積都可以一樣', icon: '✨' },
  { id: 'b3', name: '數軸大師', description: '學識用數軸比較分數大細', icon: '📏' }
];

export const CUT_OPTIONS = [2, 3, 4, 6, 8, 10, 12];
