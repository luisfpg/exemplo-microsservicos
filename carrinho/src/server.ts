import { server as HapiServer } from '@hapi/hapi';
import dotenv from 'dotenv';
import { Servico } from './servico';
dotenv.config();

const init = async () => {

  const servico = new Servico();

  const server = HapiServer({
    port: process.env.PORT
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: () => servico.ler()
  });

  server.route({
    method: 'PUT',
    path: '/{id}',
    handler: req => servico.ajustar(req.params.id, Number(req.query.quantidade))
  });

  server.route({
    method: 'DELETE',
    path: '/',
    handler: () => servico.limpar()
  });

  server.route({
    method: 'POST',
    path: '/checkout',
    handler: () => servico.checkout()
  });

  await server.start();
  console.log('Carrinho de compras iniciado em %s', server.info.uri);
};

init();