

Consul como service discovery

```bash
docker run -d --name=dev-consul -e CONSUL_BIND_INTERFACE=eth0 -p 8301:8301 consul
```