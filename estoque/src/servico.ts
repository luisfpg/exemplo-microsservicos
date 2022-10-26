import { notFound } from '@hapi/boom';
import { Consul } from 'consul';
import { ProdutosApi } from './api/produtos-api';
import { ProdutoEstoque } from './query/produto-estoque';

export class Servico {
  private produtosApi = new ProdutosApi();
  private estoque = new Map<string, number>();

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
  }

  async ajustar(id: string, ajuste: number): Promise<number> {
    const produto = await this.ler(id);
    const mult = Math.pow(10, produto.decimaisQuantidade) * 1.0;
    let estoque = produto.estoque + ajuste;
    estoque = Math.round(estoque * mult) / mult;
    this.estoque.set(id, estoque);
    return Promise.resolve(estoque);
  }

  async ler(id: string): Promise<ProdutoEstoque> {
    const estoque = this.estoque.get(id);
    if (!estoque) {
      return Promise.reject(notFound(`Nenhum estoque definido para o produto ${id}`));
    }
    const produto = await this.produtosApi.ler(id);
    const produtoEstoque: ProdutoEstoque = {
      ...produto,
      estoque
    };
    return Promise.resolve(produtoEstoque);
  }

  async popular() {
    // 1: Tomate
    this.estoque.set('1', 10.5);
    // 2: Laranja
    this.estoque.set('2', 0);
    // 3: Alface
    this.estoque.set('3', 35);
    // 4: Brócolis
    this.estoque.set('4', 27);
    // 5: Leite
    this.estoque.set('5', 120);
    // 6: Iogurte natural
    this.estoque.set('6', 41);
    // 7: Linguiça colonial
    this.estoque.set('7', 19.7);
  }
}
