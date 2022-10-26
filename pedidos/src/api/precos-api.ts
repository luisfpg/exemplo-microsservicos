import axios from 'axios';
import { Preco } from '../query/preco';

export class PrecosApi {

  baseUrl: string;

  async ler(id: string): Promise<Preco> {
    return (await axios.get(`/${id}`, {
      baseURL: this.baseUrl
    })).data;
  }
}