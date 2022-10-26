import { server as HapiServer } from '@hapi/hapi';
import Consul from 'consul';
import { randomUUID } from 'crypto';
import { DefinirPreco } from './command/definir-preco';
import { Servico } from './servico';

const consul = new Consul();
const consulId = randomUUID();

const init = async () => {

  const servico = new Servico(consul);
  await servico.popular();

  const server = HapiServer();

  server.route({
    method: 'GET',
    path: '/',
    handler: (_, reply) => reply.response('').code(200)
  });

  server.route({
    method: 'GET',
    path: '/api/{id}',
    handler: req => servico.ler(req.params.id)
  });

  server.route({
    method: 'PUT',
    path: '/api/{id}',
    handler: req => servico.definir(req.params.id, req.payload as DefinirPreco)
  });

  await server.start();
  console.log('Preços iniciado em %s', server.info.uri);

  const opts: Consul.Agent.Service.RegisterOptions = {
    name: 'precos',
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