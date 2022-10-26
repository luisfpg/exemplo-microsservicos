import { badData, notFound } from '@hapi/boom';
import { ProdutoDto } from './command/produto-dto';
import { Categoria } from './query/categoria';
import { Fabricante } from './query/fabricante';
import { Produto } from './query/produto';

export class Servico {
  private produtos = new Map<string, Produto>();
  private fabricantes = new Map<string, Fabricante>();
  private categorias = new Map<string, Categoria>();

  private id = 0;

  async ler(id: string): Promise<Produto> {
    const produto = this.produtos.get(id);
    return produto ? Promise.resolve(produto) : Promise.reject(notFound(`Não econtrado: ${id}`));
  }

  async listar(): Promise<Produto[]> {
    const produtos = [...this.produtos.values()];
    produtos.sort((p1, p2) => p1.nome.localeCompare(p2.nome));
    return Promise.resolve(produtos);
  }

  async criar(dto: ProdutoDto): Promise<string> {
    await this.validar(dto);
    const produto: Produto = {
      id: String(this.id++),
      nome: dto.nome,
      decimaisQuantidade: dto.decimaisQuantidade || 0,
      minimoNoCarrinho: dto.minimoNoCarrinho || 1,
      maximoNoCarrinho: dto.maximoNoCarrinho,
      fabricante: this.fabricantes.get(dto.fabricante),
      categoria: this.categorias.get(dto.categoria)
    };
    this.produtos.set(produto.id, produto);
    return Promise.resolve(produto.id);
  }

  async atualizar(id: string, dto: ProdutoDto): Promise<void> {
    const produto = await this.ler(id);
    await this.validar(dto);
    produto.nome = dto.nome;
    produto.decimaisQuantidade = dto.decimaisQuantidade || 0;
    produto.minimoNoCarrinho = dto.minimoNoCarrinho || 1;
    produto.maximoNoCarrinho = dto.maximoNoCarrinho;
    produto.fabricante = this.fabricantes.get(dto.fabricante);
    produto.categoria = this.categorias.get(dto.categoria);
    return Promise.resolve(null);
  }

  async remover(id: string): Promise<void> {
    if (!this.produtos.has(id)) {
      Promise.reject('Não econtrado');
    }
    this.produtos.delete(id);
    return Promise.resolve(null);
  }

  private async validar(dto: ProdutoDto): Promise<void> {
    const fabricante = this.fabricantes.get(dto?.fabricante);
    const categoria = this.categorias.get(dto?.categoria);
    if (!dto || !dto.nome?.length || !fabricante || !categoria) {
      return Promise.reject(badData(`Erro de validação: ${JSON.stringify(dto)}`));
    }
    return Promise.resolve();
  }

  async popular() {
    const fabricantes: Fabricante[] = [
      { id: 'fv', nome: 'Fazenda Verde' },
      { id: 'al', nome: 'Alimentícios Ltda' },
      { id: 'cf', nome: 'CoopFoods' }
    ];
    fabricantes.forEach(f => this.fabricantes.set(f.id, f));

    const categorias: Categoria[] = [
      { id: 'v', nome: 'Verduras' },
      { id: 'le', nome: 'Legumes' },
      { id: 'f', nome: 'Frutas' },
      { id: 'c', nome: 'Carnes' },
      { id: 'e', nome: 'Embutidos' },
      { id: 'la', nome: 'Laticínios' },
    ];
    categorias.forEach(c => this.categorias.set(c.id, c));

    await this.criar({ nome: 'Tomate', decimaisQuantidade: 3, minimoNoCarrinho: 0.5, categoria: 'f', fabricante: 'al' });
    await this.criar({ nome: 'Laranja', decimaisQuantidade: 3, minimoNoCarrinho: 0.5, categoria: 'f', fabricante: 'al' });
    await this.criar({ nome: 'Alface', decimaisQuantidade: 0, minimoNoCarrinho: 1, categoria: 'v', fabricante: 'fv' });
    await this.criar({ nome: 'Brócolis', decimaisQuantidade: 0, minimoNoCarrinho: 1, categoria: 'le', fabricante: 'fv' });
    await this.criar({ nome: 'Leite', decimaisQuantidade: 0, minimoNoCarrinho: 1, categoria: 'la', fabricante: 'cf' });
    await this.criar({ nome: 'Iogurte natural', decimaisQuantidade: 0, minimoNoCarrinho: 1, categoria: 'la', fabricante: 'cf' });
    await this.criar({ nome: 'Linguiça colonial', decimaisQuantidade: 3, minimoNoCarrinho: 0.5, categoria: 'e', fabricante: 'cf' });
  }
}
