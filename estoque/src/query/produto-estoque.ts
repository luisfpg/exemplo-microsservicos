import { Produto } from './produto';

export interface ProdutoEstoque extends Produto {
  estoque: number;
}