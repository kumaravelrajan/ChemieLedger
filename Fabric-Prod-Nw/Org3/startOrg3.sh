#!/bin/bash

set -e
set -o xtrace

# println echos string
function println() {
  echo -e "$1"
}

C_YELLOW='\033[1;33m'
C_RESET='\033[0m'
function infoln() {
    set +x
    println "${C_YELLOW}*****************************************${C_RESET}"
    println "${C_YELLOW} --------> ${1}${C_RESET}"
    println "${C_YELLOW}*****************************************${C_RESET}"
    set -x
}

infoln "Starting base network before adding org3"
ORG3PATH=$PWD
cd ../Main-Docker-Compose/
./start.sh
cd $ORG3PATH
infoln "Base network created successfully. Adding org3 to network now.."

# Export path of bin files
export PATH=${PWD}/../Fabric-bin:$PATH
infoln "PATH=$PATH"

infoln "Setup Org3’s CA"
docker-compose up -d rca-org3

infoln "Enroll Org3’s CA Admin"
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org3/ca/crypto/ca-cert.pem
export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org3/ca/admin
fabric-ca-client enroll -d -u https://rca-org3-admin:rca-org3-adminpw@0.0.0.0:7056
fabric-ca-client register -d --id.name peer1-org3 --id.secret peer1PW --id.type peer -u https://0.0.0.0:7056
fabric-ca-client register -d --id.name peer2-org3 --id.secret peer2PW --id.type peer -u https://0.0.0.0:7056
fabric-ca-client register -d --id.name admin-org3 --id.secret org3AdminPW --id.type user -u https://0.0.0.0:7056
fabric-ca-client register -d --id.name user-org3 --id.secret org3UserPW --id.type user -u https://0.0.0.0:7056

infoln "Setup Org3’s Peers"
infoln "Enroll Peer1"
mkdir -p /tmp/hyperledger/org3/peer1/assets/ca
cp /tmp/hyperledger/org3/ca/crypto/ca-cert.pem /tmp/hyperledger/org3/peer1/assets/ca/ca-cert.pem

export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org3/peer1
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org3/peer1/assets/ca/ca-cert.pem
export FABRIC_CA_CLIENT_MSPDIR=msp
fabric-ca-client enroll -d -u https://peer1-org3:peer1PW@0.0.0.0:7056

#Enroll Peer 1 against TLS CA
mkdir -p /tmp/hyperledger/org3/peer1/assets/tls-ca
cp /tmp/hyperledger/tls-ca/crypto/ca-cert.pem /tmp/hyperledger/org3/peer1/assets/tls-ca/tls-ca-cert.pem

export FABRIC_CA_CLIENT_MSPDIR=tls-msp
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org3/peer1/assets/tls-ca/tls-ca-cert.pem
fabric-ca-client enroll -d -u https://peer1-org3:peer1PW@0.0.0.0:7052 --enrollment.profile tls --csr.hosts peer1-org3
#Change name of key to key.pem
mv /tmp/hyperledger/org3/peer1/tls-msp/keystore/* /tmp/hyperledger/org3/peer1/tls-msp/keystore/key.pem

infoln "Enroll Peer2"
mkdir -p /tmp/hyperledger/org3/peer2/assets/ca
cp /tmp/hyperledger/org3/ca/crypto/ca-cert.pem /tmp/hyperledger/org3/peer2/assets/ca/ca-cert.pem

export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org3/peer2
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org3/peer2/assets/ca/ca-cert.pem
export FABRIC_CA_CLIENT_MSPDIR=msp
fabric-ca-client enroll -d -u https://peer2-org3:peer2PW@0.0.0.0:7056

#Enroll Peer 2 against TLS CA
mkdir -p /tmp/hyperledger/org3/peer2/assets/tls-ca
cp /tmp/hyperledger/tls-ca/crypto/ca-cert.pem /tmp/hyperledger/org3/peer2/assets/tls-ca/tls-ca-cert.pem

export FABRIC_CA_CLIENT_MSPDIR=tls-msp
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org3/peer2/assets/tls-ca/tls-ca-cert.pem
fabric-ca-client enroll -d -u https://peer2-org3:peer2PW@0.0.0.0:7052 --enrollment.profile tls --csr.hosts peer2-org3

#Change name of key to key.pem
mv /tmp/hyperledger/org3/peer2/tls-msp/keystore/* /tmp/hyperledger/org3/peer2/tls-msp/keystore/key.pem

ifnoln "Enroll Org3's Admin"
export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org3/admin
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org3/peer1/assets/ca/ca-cert.pem
export FABRIC_CA_CLIENT_MSPDIR=msp
fabric-ca-client enroll -d -u https://admin-org3:org3AdminPW@0.0.0.0:7056

mkdir -p /tmp/hyperledger/org3/msp

echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/ca-cert.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/ca-cert.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/ca-cert.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/ca-cert.pem
    OrganizationalUnitIdentifier: orderer' > "/tmp/hyperledger/org3/msp/config.yaml"

cp /tmp/hyperledger/org3/msp/config.yaml /tmp/hyperledger/org3/peer1/msp/
cp /tmp/hyperledger/org3/msp/config.yaml /tmp/hyperledger/org3/peer2/msp/
cp /tmp/hyperledger/org3/msp/config.yaml /tmp/hyperledger/org3/admin/msp/
mv /tmp/hyperledger/org3/peer1/msp/cacerts/* /tmp/hyperledger/org3/peer1/msp/cacerts/ca-cert.pem
mv /tmp/hyperledger/org3/peer2/msp/cacerts/* /tmp/hyperledger/org3/peer2/msp/cacerts/ca-cert.pem
mv /tmp/hyperledger/org3/admin/msp/cacerts/* /tmp/hyperledger/org3/admin/msp/cacerts/ca-cert.pem

infoln "Launch Org3’s Peers"
docker-compose up -d peer1-org3
docker-compose up -d peer2-org3

#mkdir /tmp/hyperledger/org3/peer1/msp/admincerts
#cp /tmp/hyperledger/org3/admin/msp/signcerts/cert.pem /tmp/hyperledger/org3/peer1/msp/admincerts/org3-admin-cert.pem
#TODO exchange cert.pem to Peer 2

infoln "Create CLI Container"
docker-compose up -d cli-org3

infoln "Create and Join Channel"
cp /tmp/hyperledger/org0/orderer/channel.tx /tmp/hyperledger/org3/peer1/assets/channel.tx

infoln "peer1-org3 Creating channel and peer1-org3 and peer2-org3 joining channel"
docker exec -it cli-org3 sh -c "export CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/admin/msp \
&& peer channel create -c mychannel -f /tmp/hyperledger/org3/peer1/assets/channel.tx -o orderer1-org0:7050 --outputBlock /tmp/hyperledger/org3/peer1/assets/mychannel.block --tls --cafile /tmp/hyperledger/org3/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem \
&& export CORE_PEER_ADDRESS=peer1-org3:7051 \
&& peer channel join -b /tmp/hyperledger/org3/peer1/assets/mychannel.block \
&& export CORE_PEER_ADDRESS=peer2-org3:7051 \
&& peer channel join -b /tmp/hyperledger/org3/peer1/assets/mychannel.block"

infoln "Install and Approve Chaincode"
infoln "Org3"
rsync -a --exclude=node_modules/ ../chaincode /tmp/hyperledger/org3/peer1/assets/

docker exec -it cli-org3 sh -c 'export CORE_PEER_ADDRESS=peer1-org3:7051 \
&& export CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/admin/msp \
&& peer lifecycle chaincode package cp.tar.gz --lang node --path /opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode --label cp_0 \
&& peer lifecycle chaincode install cp.tar.gz \
&& export CORE_PEER_ADDRESS=peer2-org3:7051 \
&& peer lifecycle chaincode install cp.tar.gz \
&& export PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep Package | sed -e "s/.*Package ID: \(.*\), Label:.*/\1/") \
&& peer lifecycle chaincode approveformyorg --orderer orderer1-org0:7050 --tls --cafile /tmp/hyperledger/org3/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem --channelID mychannel --name mycc -v 0 --package-id $PACKAGE_ID --sequence 1
'

infoln "Test Chaincode from Org3"
docker exec -it cli-org3 sh -c "export CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/admin/msp \
&& peer chaincode invoke -C mychannel -n mycc -c '{\"Args\":[\"addProduct\",\"x\",\"36.0\",\"kg\", \"\", \"{}\", \"[]\", \"{}\"]}' --tls --cafile /tmp/hyperledger/org3/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem
"