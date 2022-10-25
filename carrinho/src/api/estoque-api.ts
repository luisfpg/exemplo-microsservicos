import axios, { AxiosInstance } from 'axios';
import { Produto } from '../query/produto';

export class EstoqueApi {

  private request: AxiosInstance;
  constructor() {
    this.request = axios.create({
      baseURL: process.env.ESTOQUE_URL
    });
  }

  async ler(id: string): Promise<Produto> {
    return (await this.request.get(`/${id}`)).data;
  }
}