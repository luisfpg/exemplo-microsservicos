import { Estoque } from "./estoque";
import { Preco } from "./preco";
import { Produto } from "./produto";

export interface ProdutoPrecoEstoque extends Produto, Preco, Estoque {
}