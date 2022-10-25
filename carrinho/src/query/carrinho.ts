import { Item } from './item';

export interface Carrinho {
  usuario: string,
  itens: Item[],
  valorTotal: number
}