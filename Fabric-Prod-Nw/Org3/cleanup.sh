#!/bin/bash
# Probably needs to be called with sudo!

ORG3PATH=$PWD
cd ../Base-Network/ && ./cleanup.sh
cd $ORG3PATH

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