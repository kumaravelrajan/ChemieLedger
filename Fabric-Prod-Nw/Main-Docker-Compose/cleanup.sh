#!/bin/bash
# Probably needs to be called with sudo!
echo "Stopping and removing all containers..."
docker rm -f $(docker ps -a -q)

echo "Removing all files from /tmp/hyperledger ..."
rm -rf /tmp/hyperledger/*

if [ -f "./docker-compose.yml" ]
then
    rm ./docker-compose.yml
    echo "Removed docker compose file"
fi

if [ -f "./configtx.yaml" ]
then
    rm ./configtx.yaml
    echo "Removed configtx.yaml file"
fi