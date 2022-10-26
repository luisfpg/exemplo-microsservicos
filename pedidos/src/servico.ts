import { badRequest, notFound } from '@hapi/boom';
import { Consul } from 'consul';
import { randomUUID } from 'crypto';
import { EstoqueApi } from './api/estoque-api';
import { PrecosApi } from './api/precos-api';
import { ProdutosApi } from './api/produtos-api';
import { FecharPedido } from './command/fechar-pedido';
import { Item } from './query/item';
import { Pedido } from './query/pedido';

export class Servico {
  private produtosApi = new ProdutosApi();
  private estoqueApi = new EstoqueApi();
  private precosApi = new PrecosApi();

  private pedidos = new Map<string, Pedido>();

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
        service: 'preco',
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

  async fechar(params: FecharPedido): Promise<Pedido> {
    if (!params.usuario || params.itens.length === 0) {
      return Promise.reject(badRequest(`Nenhum item! ${JSON.stringify(params)}`));
    }

    const itens: Item[] = [];
    let total = 0;
    for (const i of params.itens) {
      const produto = await this.produtosApi.ler(i.produto);
      const quantidade = i.quantidade;
      if (quantidade < produto.minimoNoCarrinho || quantidade > produto.maximoNoCarrinho) {
        return Promise.reject(badRequest(`Quantidade inválida de ${quantidade} para ${produto.nome}`));
      }
      const estoque = await this.estoqueApi.ler(produto.id);
      if (estoque.estoque < quantidade) {
        return Promise.reject(badRequest(`Sem estoque de ${quantidade} para ${produto.nome}`));
      }
      const preco = await this.precosApi.ler(produto.id);
      const precoUnitario = preco.precoPromocional || preco.precoNormal;
      const precoTotal = quantidade * precoUnitario;
      itens.push({ produto, precoUnitario, quantidade, precoTotal });
      total += precoTotal;
    }

    const pedido: Pedido = {
      id: randomUUID(),
      usuario: params.usuario,
      data: new Date(),
      itens,
      precoTotal: total
    };

    this.pedidos.set(pedido.id, pedido);

    return Promise.resolve(pedido);
  }

  async ler(id: string): Promise<Pedido> {
    const pedido = this.pedidos.get(id);
    if (!pedido) {
      return Promise.reject(notFound(`Pedido não encontrado: ${id}`));
    }
    return Promise.resolve(pedido);
  }
}