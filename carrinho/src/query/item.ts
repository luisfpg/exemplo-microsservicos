import { Produto } from './produto';

export interface Item {
  produto: Produto,
  quantidade: number,
  valorTotal: number,
}