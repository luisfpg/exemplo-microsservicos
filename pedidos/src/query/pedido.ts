import { Item } from './item';

export interface Pedido {
  id: string,
  usuario: string,
  data: Date,
  itens: Item[],
  precoTotal: number
}