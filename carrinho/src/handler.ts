import { Lifecycle } from '@hapi/hapi';

export const handler: Lifecycle.Method = (req) => {
  const nome = req.query.nome || 'Mundo';
  return {
    mensagem: `Olá ${nome}!`
  };
};
