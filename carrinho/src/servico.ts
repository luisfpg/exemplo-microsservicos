import { badData, badRequest } from '@hapi/boom';
import { Consul } from 'consul';
import { EstoqueApi } from './api/estoque-api';
import { PrecosApi } from './api/precos-api';
import { ProdutosApi } from './api/produtos-api';
import { Carrinho } from './query/carrinho';
import { ProdutoPrecoEstoque } from './query/produto-preco-estoque';

export class Servico {
  private produtosApi = new ProdutosApi();
  private estoqueApi = new EstoqueApi();
  private precosApi = new PrecosApi();

  private carrinhos = new Map<string, Carrinho>();

  constructor(consul: Consul) {
    consul.watch({
      method: consul.health.service,
      options: ({
        service: 'produtos',
        passing: true
      } as any)
    }).on('change', (nodos) => {
      this.produtosApi.baseUrl = nodos.map(n => `http://${n.Service.Address}:${n.Service.Port}/api`)[0];
    }).on('error', e => console.error(e));

    consul.watch({
      method: consul.health.service,
      options: ({
        service: 'precos',
        passing: true
      } as any)
    }).on('change', (nodos) => {
      this.precosApi.baseUrl = nodos.map(n => `http://${n.Service.Address}:${n.Service.Port}/api`)[0];
    }).on('error', e => console.error(e));

    consul.watch({
      method: consul.health.service,
      options: ({
        service: 'estoque',
        passing: true
      } as any)
    }).on('change', (nodos) => {
      this.estoqueApi.baseUrl = nodos.map(n => `http://${n.Service.Address}:${n.Service.Port}/api`)[0];
    }).on('error', e => console.error(e));
  }

  async ajustar(idProduto: string, quantidade?: number): Promise<Carrinho> {
    const carrinho = await this.ler();
    let item = carrinho.itens.find(i => i.produto.id === idProduto);
    const produto = await this.produto(idProduto);
    const mult = Math.pow(10, produto.decimaisQuantidade);
    if (quantidade === 0) {
      carrinho.itens = carrinho.itens.filter(i => i.produto.id !== produto.id);
    } else {
      if (!quantidade) {
        quantidade = produto.minimoNoCarrinho;
      }
      if (quantidade < produto.minimoNoCarrinho || quantidade > produto.maximoNoCarrinho) {
        return Promise.reject(badData(`Quantidade inválida: ${quantidade}`));
      }
      quantidade = Math.round(quantidade * mult) / mult;
      if (!item) {
        item = { produto, quantidade, valorTotal: 0 };
        carrinho.itens.push(item);
        carrinho.itens.sort((a, b) => a.produto.nome.localeCompare(b.produto.nome));
      } else {
        item.produto = produto;
        item.quantidade = quantidade;
      }
    }
    this.atualizarTotais(carrinho);
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
    return Promise.resolve(null);
  }

  private async produto(id: string): Promise<ProdutoPrecoEstoque> {
    const produto = await this.produtosApi.ler(id);
    const estoque = await this.estoqueApi.ler(id);
    const preco = await this.precosApi.ler(id);
    return Promise.resolve({
      ...produto,
      ...estoque,
      ...preco
    });
  }

  async checkout(): Promise<void> {
    const carrinho = await this.ler();
    if (carrinho.itens.length === 0) {
      return Promise.reject(badRequest('Carrinho vazio!'));
    }

    // Atualiza todos os produtos
    for (const item of carrinho.itens) {
      item.produto = await this.produto(item.produto.id);
    }
    this.atualizarTotais(carrinho);
  }

  private usuario() {
    // Deveria trazer o usuário logado...
    return 'usuarioLogado';
  }

  private atualizarTotais(carrinho: Carrinho) {
    let total = 0;
    for (const item of carrinho.itens) {
      item.valorTotal = item.quantidade * (item.produto.precoPromocional || item.produto.precoNormal);
      total += item.valorTotal;
    }
    carrinho.valorTotal = total;
  }
}
