# MongoDB
Assuming that you have access to the docker-compose command (Do not forget to start Docker Desktop), navigate to this folder and run:
```sh
docker-compose up --build
```

If you want to remove the containers from your machine, stop the containers and run:
```sh
docker rm $(docker ps -a -q)
```