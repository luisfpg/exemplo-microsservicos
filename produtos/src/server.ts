import { server as HapiServer } from '@hapi/hapi';
import { ProdutoDto } from './command/produto-dto';
import { Servico } from './servico';
import dotenv from 'dotenv';
dotenv.config();

const init = async () => {

  const servico = new Servico();
  await servico.popular();

  const server = HapiServer({
    port: process.env.PORT
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: () => servico.listar()
  });

  server.route({
    method: 'POST',
    path: '/',
    handler: req => servico.criar(req.payload as ProdutoDto)
  });

  server.route({
    method: 'GET',
    path: '/{id}',
    handler: req => servico.ler(req.params.id)
  });

  server.route({
    method: 'PUT',
    path: '/{id}',
    handler: req => servico.atualizar(req.params.id, req.payload as ProdutoDto)
  });

  server.route({
    method: 'DELETE',
    path: '/{id}',
    handler: req => servico.remover(req.params.id)
  });

  await server.start();
  console.log('Produtos iniciado em %s', server.info.uri);
};

init();