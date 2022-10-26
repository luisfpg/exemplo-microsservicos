import { server as HapiServer } from '@hapi/hapi';
import Consul from 'consul';
import { randomUUID } from 'crypto';
import { FecharPedido } from './command/fechar-pedido';
import { Servico } from './servico';

const consul = new Consul();
const consulId = randomUUID();

const init = async () => {

  const servico = new Servico(consul);

  const server = HapiServer();

  server.route({
    method: 'GET',
    path: '/',
    handler: (_, reply) => reply.response('').code(200)
  });

  server.route({
    method: 'POST',
    path: '/api/',
    handler: req => servico.fechar(req.payload as FecharPedido)
  });

  server.route({
    method: 'GET',
    path: '/api/{id}',
    handler: req => servico.ler(req.params.id)
  });

  await server.start();
  console.log('Pedidos iniciado em %s', server.info.uri);

  const opts: Consul.Agent.Service.RegisterOptions = {
    name: 'pedidos',
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