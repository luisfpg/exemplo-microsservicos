import { badData, badRequest } from '@hapi/boom';
import { EstoqueApi } from './api/estoque-api';
import { PrecosApi } from './api/precos-api';
import { ProdutosApi } from './api/produtos-api';
import { Carrinho } from './query/carrinho';

export class Servico {
  private produtosApi = new ProdutosApi();
  private estoqueApi = new EstoqueApi();
  private precosApi = new PrecosApi();

  private carrinhos = new Map<string, Carrinho>();

  async ajustar(idProduto: string, quantidade?: number): Promise<Carrinho> {
    const carrinho = await this.ler();
    let item = carrinho.itens.find(i => i.produto.id === idProduto);
    const produto = await this.produtosApi.ler(idProduto);
    const mult = Math.pow(10, produto.decimaisQuantidade);
    if (!quantidade) {
      quantidade = produto.minimoNoCarrinho;
    }
    if (quantidade === 0) {
      carrinho.itens = carrinho.itens.filter(i => i.produto.id !== produto.id);
    } else {
      if (quantidade < produto.minimoNoCarrinho || quantidade > produto.maximoNoCarrinho) {
        return Promise.reject(badData(`Quantidade inválida: ${quantidade}`));
      }
      quantidade = Math.round(quantidade * mult) / mult;
      const preco = produto.precoPromocional || produto.precoNormal;
      const valorTotal = Math.round(quantidade * preco * 100) / 100.0;
      if (!item) {
        item = { produto, quantidade, valorTotal };
        carrinho.itens.push(item);
        carrinho.itens.sort((a, b) => a.produto.nome.localeCompare(b.produto.nome));
      } else {
        item.produto = produto;
        item.quantidade = quantidade;
        item.valorTotal = valorTotal;
      }
    }
    carrinho.valorTotal = carrinho.itens.map(i => i.valorTotal).reduce((soma, valor) => soma + valor, 0);
    return Promise.resolve(carrinho);
  }

  async ler(): Promise<Carrinho> {
    const usuario = this.usuario();
    let carrinho = this.carrinhos.get(usuario);
    if (!carrinho) {
      carrinho = {
        usuario,
        itens: [],
        valorTotal: 0
      };
    }
    return Promise.resolve(carrinho);
  }

  async limpar(): Promise<void> {
    this.carrinhos.delete(this.usuario());
    return Promise.resolve();
  }

  async checkout(): Promise<void> {
    const carrinho = await this.ler();
    if (carrinho.itens.length === 0) {
      return Promise.reject(badRequest('Carrinho vazio!'));
    }

  }

  usuario() {
    // Deveria trazer o usuário logado...
    return 'usuarioLogado';
  }
}
