import { badData, notFound } from '@hapi/boom';
import { DefinirPreco } from './command/definir-preco';
import { ProdutoPreco } from './query/produto-preco';
import { ProdutosApi } from './api/produtos-api';
import { Preco } from './query/preco';
import { Consul } from 'consul';

export class Servico {
  private produtosApi = new ProdutosApi();
  private precos = new Map<string, Preco>();

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

  async definir(id: string, params: DefinirPreco): Promise<void> {
    await this.validar(params);
    const preco: Preco = {
      precoNormal: params.precoNormal,
      precoPromocional: params.precoPromocional
    };
    this.precos.set(id, preco);
    return Promise.resolve(null);
  }

  async ler(id: string): Promise<ProdutoPreco> {
    const preco = this.precos.get(id);
    if (!preco) {
      return Promise.reject(notFound(`Nenhum preço definido para o produto ${id}`));
    }
    const produto = await this.produtosApi.ler(id);
    const produtoPreco: ProdutoPreco = {
      ...produto,
      ...preco
    };
    return Promise.resolve(produtoPreco);
  }

  private async validar(params: DefinirPreco): Promise<void> {
    if (!params || params.precoNormal < 0.01 || params.precoNormal > 999999999
      || params.precoPromocional > params.precoNormal) {
      return Promise.reject(badData(`Erro de validação: ${JSON.stringify(params)}`));
    }
    return Promise.resolve();
  }

  async popular() {
    // 1: Tomate
    this.precos.set('1', { precoNormal: 7.50 });
    // 2: Laranja
    this.precos.set('2', { precoNormal: 5.65 });
    // 3: Alface
    this.precos.set('3', { precoNormal: 2.10 });
    // 4: Brócolis
    this.precos.set('4', { precoNormal: 8.70, precoPromocional: 7.70 });
    // 5: Leite
    this.precos.set('5', { precoNormal: 5.50 });
    // 6: Iogurte natural
    this.precos.set('6', { precoNormal: 9.99 });
    // 7: Linguiça colonial
    this.precos.set('7', { precoNormal: 19.10, precoPromocional: 16.99 });
  }
}
