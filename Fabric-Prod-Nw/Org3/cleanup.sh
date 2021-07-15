#!/bin/bash
# Probably needs to be called with sudo!

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