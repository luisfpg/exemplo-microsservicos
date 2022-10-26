import { server as HapiServer } from '@hapi/hapi';
import Consul from 'consul';
import { randomUUID } from 'crypto';
import { ProdutoDto } from './command/produto-dto';
import { Servico } from './servico';

const consul = new Consul();
const consulId = randomUUID();

const init = async () => {

  const servico = new Servico();
  await servico.popular();

  const server = HapiServer();

  server.route({
    method: 'GET',
    path: '/',
    handler: (_, reply) => reply.response('').code(200)
  });

  server.route({
    method: 'GET',
    path: '/api/',
    handler: () => servico.listar()
  });

  server.route({
    method: 'POST',
    path: '/api/',
    handler: req => servico.criar(req.payload as ProdutoDto)
  });

  server.route({
    method: 'GET',
    path: '/api/{id}',
    handler: req => servico.ler(req.params.id)
  });

  server.route({
    method: 'PUT',
    path: '/api/{id}',
    handler: req => servico.atualizar(req.params.id, req.payload as ProdutoDto)
  });

  server.route({
    method: 'DELETE',
    path: '/api/{id}',
    handler: req => servico.remover(req.params.id)
  });

  await server.start();
  console.log('Produtos iniciado em %s', server.info.uri);

  const opts: Consul.Agent.Service.RegisterOptions = {
    name: 'produtos',
    address: server.info.host,
    port: server.info.port as number,
    id: consulId,
    check: {
      http: server.info.uri,
      interval: '5s'
    }
  };
  await consul.agent.service.register(opts);
  console.log(`Registrado no consul com id: ${consulId}`);
};

process.on('SIGINT', async () => {
  await consul.agent.service.deregister({ id: consulId });
  console.log('Removido do consul');
  process.exit();
});

init();