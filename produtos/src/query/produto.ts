import { Categoria } from './categoria';
import { Fabricante } from './fabricante';

export interface Produto {
  id: string,
  nome: string,
  decimaisQuantidade: number,
  minimoNoCarrinho: number,
  maximoNoCarrinho?: number,
  fabricante: Fabricante,
  categoria: Categoria
}