import { Produto } from './produto';

export interface Item {
  produto: Produto,
  quantidade: number,
  precoUnitario: number
  precoTotal: number
}