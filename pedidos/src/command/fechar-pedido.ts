import { ItemDto } from './item-dto';

export interface FecharPedido {
  usuario: string,
  itens: ItemDto[]
}