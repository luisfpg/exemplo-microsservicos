export interface Produto {
  id: string,
  nome: string,
  decimaisQuantidade: number,
  minimoNoCarrinho: number,
  maximoNoCarrinho?: number,
  estoque: number,
  precoNormal: number,
  precoPromocional?: number
}