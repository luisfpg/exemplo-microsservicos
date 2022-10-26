import { ProdutoPrecoEstoque } from './produto-preco-estoque';

export interface Item {
  produto: ProdutoPrecoEstoque,
  quantidade: number,
  valorTotal: number,
}