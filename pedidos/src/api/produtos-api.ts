import axios from 'axios';
import { Produto } from '../query/produto';

export class ProdutosApi {

  baseUrl: string;

  async ler(id: string): Promise<Produto> {
    return (await axios.get(`/${id}`, {
      baseURL: this.baseUrl
    })).data;
  }
}