import h2o2 from '@hapi/h2o2';
import { server as HapiServer } from '@hapi/hapi';
import Consul from 'consul';
import dotenv from 'dotenv';
dotenv.config();

const consul = new Consul();

// Configura os serviços e escuta por mudanças no Consul
const servicos = ['carrinho', 'estoque', 'pedidos', 'precos', 'produtos'];
const urls = new Map<string, string>();
for (const servico of servicos) {
  consul.watch({
    method: consul.health.service,
    options: ({
      service: servico,
      passing: true
    } as any)
  }).on('change', (nodos) => {
    urls.set(servico, nodos.map(n => `http://${n.Service.Address}:${n.Service.Port}/api`)[0]);
  }).on('error', e => console.error(e));
}

const init = async () => {
  const server = HapiServer({
    port: process.env.PORT
  });
  await server.register(h2o2);

  server.route({
    method: 'GET',
    path: '/',
    handler: (_, reply) => reply.response('').code(200)
  });

  for (const servico of servicos) {
    const prefix = `/api/${servico}`;
    server.route({
      method: '*',
      path: `${prefix}/{path*}`,
      handler: {
        proxy: {
          mapUri: async req => {
            const uri = `${urls.get(servico)}/${req.path.substring(prefix.length + 1)}${req.url.search}`;
            return Promise.resolve({ uri });
          },
          passThrough: true,
          ttl: 'upstream'
        }
      }
    });
  }

  await server.start();
  console.log('Gateway da API iniciado em %s', server.info.uri);
};

init();