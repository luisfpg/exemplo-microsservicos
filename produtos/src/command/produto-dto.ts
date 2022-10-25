export interface ProdutoDto {
  nome: string,
  decimaisQuantidade: number,
  minimoNoCarrinho: number,
  maximoNoCarrinho?: number,
  fabricante: string,
  categoria: string
}