import axios, { AxiosInstance } from 'axios';
import { Produto } from '../query/produto';

export class PrecosApi {

  private request: AxiosInstance;
  constructor() {
    this.request = axios.create({
      baseURL: process.env.PRECOS_URL
    });
  }

  async ler(id: string): Promise<Produto> {
    return (await this.request.get(`/${id}`)).data;
  }
}