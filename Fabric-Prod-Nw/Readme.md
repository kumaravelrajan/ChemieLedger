# Instructions for reproducing "failed to create channel" error
1. Copy the hyperledger/ dir to /tmp/hyperledger path in Linux/WSL2
1. Using docker-compose.yaml file up the orderer1-org0 container.
1. Up the cli-org1 container.
1. From cli-org1 container follow the steps mentioned [here](https://hyperledger-fabric-ca.readthedocs.io/en/latest/operations_guide.html#create-and-join-channel)

# To implement - 
1. Implement shell script to automate entire setup part.
