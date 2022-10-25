import axios, { AxiosInstance } from 'axios';
import { Produto } from '../query/produto';

export class ProdutosApi {

  private request: AxiosInstance;
  constructor() {
    this.request = axios.create({
      baseURL: process.env.PRODUTOS_URL
    });
  }

  async ler(id: string): Promise<Produto> {
    return (await this.request.get(`/${id}`)).data;
  }
}