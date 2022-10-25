import { server as HapiServer } from '@hapi/hapi';
import dotenv from 'dotenv';
import { Servico } from './servico';
dotenv.config();

const init = async () => {

  const servico = new Servico();
  await servico.popular();

  const server = HapiServer({
    port: process.env.PORT
  });

  server.route({
    method: 'GET',
    path: '/{id}',
    handler: req => servico.ler(req.params.id)
  });

  await server.start();
  console.log('Preços iniciado em %s', server.info.uri);
};

init();