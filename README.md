Exemplo de Microsserviços
=========================

Estes exemplos são um pouco mais complexos. A ideia é mostrar como serviços comunicam-se entre si, bem como alguns aspectos de microsserviços.

São 5 microsserviços:

- `produtos`: CRUD de produtos
- `preco`: Gerenciamento do preço dos produtos
- `estoque`: Gerenciamento do estoque de cada produto
- `carrinho`: Carrinho de compras do usuário
- `pedidos`: Gerenciamento de pedidos

Mais o `api` que é um gateway de API.

Não são usadas bases de dados reais. Cada vez que os serviços são reiniciados, os dados são reiniciados também.

# Requisitos

- [NodeJS 18+](https://nodejs.org/)
- [NPM 7+](https://www.npmjs.com/)
- [Docker](https://www.docker.com/)

# Consul

É utilizado o [Consul](https://www.consul.io/) para prover a descoberta de serviços.

Para instalá-lo, digite em um terminal:

```bash
docker run -d --name=dev-consul --network=host consul
```

# Iniciando os serviços

Cada serviço é um processo NodeJS escrito em TypeScript.
Cada subdiretório correspondente possui o projeto correspondente.
Para instalar, em um terminal, entre em cada um dos sub diretórios e digite: `npm install`.

Então, para subir, abra um terminal para cada um, entre no diretório correspondente e digite: `npm start`. Você verá a URL, incluindo a porta, onde o serviço está acessível.

# Utilizando a API

Não há interface gráfica. Você pode interagir com cada um através de sua API.
