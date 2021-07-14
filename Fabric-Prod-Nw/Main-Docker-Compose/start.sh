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

infoln "Cleaning up previous network (if any) before starting new network"
./cleanup.sh

infoln "Create custom docker-compose file"
. ./scripts/env.sh
. ./scripts/CreateDockerCompose.sh

infoln "Create custom configtx.yml file"
. ./scripts/CreateConfigTx.sh

infoln "Setup TLS CA"
infoln "Enroll TLS CA’s Admin"
docker-compose up -d ca-tls

# Export path of bin files
export PATH=${PWD}/../Fabric-bin:$PATH

export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/tls-ca/crypto/ca-cert.pem
export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/tls-ca/admin
fabric-ca-client enroll -d -u https://tls-ca-admin:tls-ca-adminpw@0.0.0.0:7052
fabric-ca-client register -d --id.name peer1-org1 --id.secret peer1PW --id.type peer -u https://0.0.0.0:7052
fabric-ca-client register -d --id.name peer2-org1 --id.secret peer2PW --id.type peer -u https://0.0.0.0:7052
fabric-ca-client register -d --id.name peer1-org2 --id.secret peer1PW --id.type peer -u https://0.0.0.0:7052
fabric-ca-client register -d --id.name peer2-org2 --id.secret peer2PW --id.type peer -u https://0.0.0.0:7052
fabric-ca-client register -d --id.name orderer1-org0 --id.secret ordererPW --id.type orderer -u https://0.0.0.0:7052

infoln "Setup Orderer Org CA"
docker-compose up -d rca-org0


infoln "Enroll Orderer Org’s CA Admin"
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org0/ca/crypto/ca-cert.pem
export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org0/ca/admin
fabric-ca-client enroll -d -u https://rca-org0-admin:rca-org0-adminpw@0.0.0.0:7053
fabric-ca-client register -d --id.name orderer1-org0 --id.secret ordererpw --id.type orderer -u https://0.0.0.0:7053
fabric-ca-client register -d --id.name admin-org0 --id.secret org0adminpw --id.type admin --id.attrs "hf.Registrar.Roles=client,hf.Registrar.Attributes=*,hf.Revoker=true,hf.GenCRL=true,admin=true:ecert,abac.init=true:ecert" -u https://0.0.0.0:7053

infoln "Setup Org1’s CA"
docker-compose up -d rca-org1


infoln "Enroll Org1’s CA Admin"
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org1/ca/crypto/ca-cert.pem
export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org1/ca/admin
fabric-ca-client enroll -d -u https://rca-org1-admin:rca-org1-adminpw@0.0.0.0:7054
fabric-ca-client register -d --id.name peer1-org1 --id.secret peer1PW --id.type peer -u https://0.0.0.0:7054
fabric-ca-client register -d --id.name peer2-org1 --id.secret peer2PW --id.type peer -u https://0.0.0.0:7054
fabric-ca-client register -d --id.name admin-org1 --id.secret org1AdminPW --id.type admin -u https://0.0.0.0:7054
fabric-ca-client register -d --id.name user-org1 --id.secret org1UserPW --id.type user -u https://0.0.0.0:7054

infoln "Setup Org2’s CA"
docker-compose up -d rca-org2


infoln "Enrolling Org2’s CA Admin"
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org2/ca/crypto/ca-cert.pem
export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org2/ca/admin
fabric-ca-client enroll -d -u https://rca-org2-admin:rca-org2-adminpw@0.0.0.0:7055
fabric-ca-client register -d --id.name peer1-org2 --id.secret peer1PW --id.type peer -u https://0.0.0.0:7055
fabric-ca-client register -d --id.name peer2-org2 --id.secret peer2PW --id.type peer -u https://0.0.0.0:7055
fabric-ca-client register -d --id.name admin-org2 --id.secret org2AdminPW --id.type admin -u https://0.0.0.0:7055
fabric-ca-client register -d --id.name user-org2 --id.secret org2UserPW --id.type user -u https://0.0.0.0:7055

infoln "Setup Org1’s Peers"
infoln "Enroll Peer1"
mkdir -p /tmp/hyperledger/org1/peer1/assets/ca
cp /tmp/hyperledger/org1/ca/crypto/ca-cert.pem /tmp/hyperledger/org1/peer1/assets/ca/ca-cert.pem

export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org1/peer1
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org1/peer1/assets/ca/ca-cert.pem
export FABRIC_CA_CLIENT_MSPDIR=msp
fabric-ca-client enroll -d -u https://peer1-org1:peer1PW@0.0.0.0:7054

mkdir -p /tmp/hyperledger/org1/peer1/assets/tls-ca
cp /tmp/hyperledger/tls-ca/crypto/ca-cert.pem /tmp/hyperledger/org1/peer1/assets/tls-ca/tls-ca-cert.pem

export FABRIC_CA_CLIENT_MSPDIR=tls-msp
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org1/peer1/assets/tls-ca/tls-ca-cert.pem
fabric-ca-client enroll -d -u https://peer1-org1:peer1PW@0.0.0.0:7052 --enrollment.profile tls --csr.hosts peer1-org1

mv /tmp/hyperledger/org1/peer1/tls-msp/keystore/* /tmp/hyperledger/org1/peer1/tls-msp/keystore/key.pem

infoln "Enroll Peer2"
mkdir -p /tmp/hyperledger/org1/peer2/assets/ca
cp /tmp/hyperledger/org1/ca/crypto/ca-cert.pem /tmp/hyperledger/org1/peer2/assets/ca/ca-cert.pem

export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org1/peer2
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org1/peer2/assets/ca/ca-cert.pem
export FABRIC_CA_CLIENT_MSPDIR=msp
fabric-ca-client enroll -d -u https://peer2-org1:peer2PW@0.0.0.0:7054

mkdir -p /tmp/hyperledger/org1/peer2/assets/tls-ca
cp /tmp/hyperledger/tls-ca/crypto/ca-cert.pem /tmp/hyperledger/org1/peer2/assets/tls-ca/tls-ca-cert.pem

export FABRIC_CA_CLIENT_MSPDIR=tls-msp
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org1/peer2/assets/tls-ca/tls-ca-cert.pem
fabric-ca-client enroll -d -u https://peer2-org1:peer2PW@0.0.0.0:7052 --enrollment.profile tls --csr.hosts peer2-org1

mv /tmp/hyperledger/org1/peer2/tls-msp/keystore/* /tmp/hyperledger/org1/peer2/tls-msp/keystore/key.pem

infoln "Enroll Org1’s Admin"
export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org1/admin
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org1/peer1/assets/ca/ca-cert.pem
export FABRIC_CA_CLIENT_MSPDIR=msp
fabric-ca-client enroll -d -u https://admin-org1:org1AdminPW@0.0.0.0:7054

mkdir -p /tmp/hyperledger/org1/msp

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
    OrganizationalUnitIdentifier: orderer' > "/tmp/hyperledger/org1/msp/config.yaml"

cp /tmp/hyperledger/org1/msp/config.yaml /tmp/hyperledger/org1/peer1/msp/
cp /tmp/hyperledger/org1/msp/config.yaml /tmp/hyperledger/org1/peer2/msp/
cp /tmp/hyperledger/org1/msp/config.yaml /tmp/hyperledger/org1/admin/msp/
mv /tmp/hyperledger/org1/peer1/msp/cacerts/* /tmp/hyperledger/org1/peer1/msp/cacerts/ca-cert.pem
mv /tmp/hyperledger/org1/peer2/msp/cacerts/* /tmp/hyperledger/org1/peer2/msp/cacerts/ca-cert.pem
mv /tmp/hyperledger/org1/admin/msp/cacerts/* /tmp/hyperledger/org1/admin/msp/cacerts/ca-cert.pem

infoln "Launch Org1’s Peers"
docker-compose up -d peer1-org1
docker-compose up -d peer2-org1


infoln "Setup Org2’s Peers"
infoln "Enroll Peer1"
mkdir -p /tmp/hyperledger/org2/peer1/assets/ca
cp /tmp/hyperledger/org2/ca/crypto/ca-cert.pem /tmp/hyperledger/org2/peer1/assets/ca/ca-cert.pem

export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org2/peer1
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org2/peer1/assets/ca/ca-cert.pem
export FABRIC_CA_CLIENT_MSPDIR=msp
fabric-ca-client enroll -d -u https://peer1-org2:peer1PW@0.0.0.0:7055

mkdir -p /tmp/hyperledger/org2/peer1/assets/tls-ca
cp /tmp/hyperledger/tls-ca/crypto/ca-cert.pem /tmp/hyperledger/org2/peer1/assets/tls-ca/tls-ca-cert.pem

export FABRIC_CA_CLIENT_MSPDIR=tls-msp
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org2/peer1/assets/tls-ca/tls-ca-cert.pem
fabric-ca-client enroll -d -u https://peer1-org2:peer1PW@0.0.0.0:7052 --enrollment.profile tls --csr.hosts peer1-org2

mv /tmp/hyperledger/org2/peer1/tls-msp/keystore/* /tmp/hyperledger/org2/peer1/tls-msp/keystore/key.pem

infoln "Enroll Peer2"
mkdir -p /tmp/hyperledger/org2/peer2/assets/ca
cp /tmp/hyperledger/org2/ca/crypto/ca-cert.pem /tmp/hyperledger/org2/peer2/assets/ca/ca-cert.pem

export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org2/peer2
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org2/peer2/assets/ca/ca-cert.pem
export FABRIC_CA_CLIENT_MSPDIR=msp
fabric-ca-client enroll -d -u https://peer2-org2:peer2PW@0.0.0.0:7055

mkdir -p /tmp/hyperledger/org2/peer2/assets/tls-ca
cp /tmp/hyperledger/tls-ca/crypto/ca-cert.pem /tmp/hyperledger/org2/peer2/assets/tls-ca/tls-ca-cert.pem

export FABRIC_CA_CLIENT_MSPDIR=tls-msp
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org2/peer2/assets/tls-ca/tls-ca-cert.pem
fabric-ca-client enroll -d -u https://peer2-org2:peer2PW@0.0.0.0:7052 --enrollment.profile tls --csr.hosts peer2-org2

mv /tmp/hyperledger/org2/peer2/tls-msp/keystore/* /tmp/hyperledger/org2/peer2/tls-msp/keystore/key.pem


infoln "Enroll Org2’s Admin"
export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org2/admin
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org2/peer1/assets/ca/ca-cert.pem
export FABRIC_CA_CLIENT_MSPDIR=msp
fabric-ca-client enroll -d -u https://admin-org2:org2AdminPW@0.0.0.0:7055

mkdir -p /tmp/hyperledger/org2/msp

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
    OrganizationalUnitIdentifier: orderer' > "/tmp/hyperledger/org2/msp/config.yaml"

cp /tmp/hyperledger/org2/msp/config.yaml /tmp/hyperledger/org2/peer1/msp/
cp /tmp/hyperledger/org2/msp/config.yaml /tmp/hyperledger/org2/peer2/msp/
cp /tmp/hyperledger/org2/msp/config.yaml /tmp/hyperledger/org2/admin/msp/
mv /tmp/hyperledger/org2/peer1/msp/cacerts/* /tmp/hyperledger/org2/peer1/msp/cacerts/ca-cert.pem
mv /tmp/hyperledger/org2/peer2/msp/cacerts/* /tmp/hyperledger/org2/peer2/msp/cacerts/ca-cert.pem
mv /tmp/hyperledger/org2/admin/msp/cacerts/* /tmp/hyperledger/org2/admin/msp/cacerts/ca-cert.pem

docker-compose up -d peer1-org2
docker-compose up -d peer2-org2


infoln "Setup Orderer"
infoln "Enroll Orderer"
mkdir -p /tmp/hyperledger/org0/orderer/assets/ca/
cp /tmp/hyperledger/org0/ca/crypto/ca-cert.pem /tmp/hyperledger/org0/orderer/assets/ca/ca-cert.pem

export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org0/orderer
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org0/orderer/assets/ca/ca-cert.pem
fabric-ca-client enroll -d -u https://orderer1-org0:ordererpw@0.0.0.0:7053

mkdir -p /tmp/hyperledger/org0/orderer/assets/tls-ca
cp /tmp/hyperledger/tls-ca/crypto/ca-cert.pem /tmp/hyperledger/org0/orderer/assets/tls-ca/tls-ca-cert.pem

export FABRIC_CA_CLIENT_MSPDIR=tls-msp
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org0/orderer/assets/tls-ca/tls-ca-cert.pem
fabric-ca-client enroll -d -u https://orderer1-org0:ordererPW@0.0.0.0:7052 --enrollment.profile tls --csr.hosts orderer1-org0

mv /tmp/hyperledger/org0/orderer/tls-msp/keystore/* /tmp/hyperledger/org0/orderer/tls-msp/keystore/key.pem

infoln "Enroll Org0’s Admin"
export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org0/admin
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org0/orderer/assets/ca/ca-cert.pem
export FABRIC_CA_CLIENT_MSPDIR=msp
fabric-ca-client enroll -d -u https://admin-org0:org0adminpw@0.0.0.0:7053

mkdir -p /tmp/hyperledger/org0/msp

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
    OrganizationalUnitIdentifier: orderer' > "/tmp/hyperledger/org0/msp/config.yaml"

cp /tmp/hyperledger/org0/msp/config.yaml /tmp/hyperledger/org0/admin/msp/
cp /tmp/hyperledger/org0/msp/config.yaml /tmp/hyperledger/org0/orderer/msp/
mv /tmp/hyperledger/org0/admin/msp/cacerts/* /tmp/hyperledger/org0/admin/msp/cacerts/ca-cert.pem
mv /tmp/hyperledger/org0/orderer/msp/cacerts/* /tmp/hyperledger/org0/orderer/msp/cacerts/ca-cert.pem

infoln "Create Genesis Block and Channel Transaction"

mkdir -p /tmp/hyperledger/org0/msp/cacerts
cp /tmp/hyperledger/org0/ca/crypto/ca-cert.pem /tmp/hyperledger/org0/msp/cacerts/ca-cert.pem
mkdir -p /tmp/hyperledger/org0/msp/tlscacerts
cp /tmp/hyperledger/tls-ca/crypto/ca-cert.pem /tmp/hyperledger/org0/msp/tlscacerts/tls-ca-cert.pem

mkdir -p /tmp/hyperledger/org1/msp/cacerts
cp /tmp/hyperledger/org1/ca/crypto/ca-cert.pem /tmp/hyperledger/org1/msp/cacerts/ca-cert.pem
mkdir -p /tmp/hyperledger/org1/msp/tlscacerts
cp /tmp/hyperledger/tls-ca/crypto/ca-cert.pem /tmp/hyperledger/org1/msp/tlscacerts/tls-ca-cert.pem

mkdir -p /tmp/hyperledger/org2/msp/cacerts
cp /tmp/hyperledger/org2/ca/crypto/ca-cert.pem /tmp/hyperledger/org2/msp/cacerts/ca-cert.pem
mkdir -p /tmp/hyperledger/org2/msp/tlscacerts
cp /tmp/hyperledger/tls-ca/crypto/ca-cert.pem /tmp/hyperledger/org2/msp/tlscacerts/tls-ca-cert.pem


configtxgen -profile OrgsOrdererGenesis -outputBlock /tmp/hyperledger/org0/orderer/genesis.block -channelID syschannel
configtxgen -profile OrgsChannel -outputCreateChannelTx /tmp/hyperledger/org0/orderer/channel.tx -channelID mychannel

infoln "Launch Orderer"
docker-compose up -d orderer1-org0

infoln "Create CLI Containers"
infoln "Launch Org1’s CLI"
docker-compose up -d cli-org1

infoln "Launch Org2’s CLI"
docker-compose up -d cli-org2

infoln "Create and Join Channel"

cp /tmp/hyperledger/org0/orderer/channel.tx /tmp/hyperledger/org1/peer1/assets/channel.tx
cp /tmp/hyperledger/org0/orderer/channel.tx /tmp/hyperledger/org2/peer1/assets/channel.tx

infoln "peer1-org1 Creating channel and peer1-org1 and peer2-org1 joining channel"
docker exec -it cli-org1 sh -c "peer channel create -c mychannel -f /tmp/hyperledger/org1/peer1/assets/channel.tx -o orderer1-org0:$ORDERER1_ORG0_PORT --outputBlock /tmp/hyperledger/org1/peer1/assets/mychannel.block --tls --cafile /tmp/hyperledger/org1/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem \
&& export CORE_PEER_ADDRESS=peer1-org1:$PEER1_ORG1_PORT \
&& peer channel join -b /tmp/hyperledger/org1/peer1/assets/mychannel.block \
&& export CORE_PEER_ADDRESS=peer2-org1:$PEER2_ORG1_PORT \
&& peer channel join -b /tmp/hyperledger/org1/peer1/assets/mychannel.block"

infoln "peer1-org2 and peer2-org2 joining channel"
cp /tmp/hyperledger/org1/peer1/assets/mychannel.block /tmp/hyperledger/org2/peer1/assets/mychannel.block
docker exec -it cli-org2 sh -c "export CORE_PEER_ADDRESS=peer1-org2:$PEER1_ORG2_PORT \
&& peer channel join -b /tmp/hyperledger/org2/peer1/assets/mychannel.block \
&& export CORE_PEER_ADDRESS=peer2-org2:$PEER2_ORG2_PORT \
&& peer channel join -b /tmp/hyperledger/org2/peer1/assets/mychannel.block"

infoln "Install and Approve Chaincode"
infoln "Org1"
rsync -a --exclude=node_modules/ ../chaincode /tmp/hyperledger/org1/peer1/assets/

docker exec -it cli-org1 sh -c "export CORE_PEER_ADDRESS=peer1-org1:$PEER1_ORG1_PORT \
&& peer lifecycle chaincode package cp.tar.gz --lang node --path /opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode --label cp_0 \
&& peer lifecycle chaincode install cp.tar.gz \
&& export CORE_PEER_ADDRESS=peer2-org1:$PEER2_ORG1_PORT \
&& peer lifecycle chaincode install cp.tar.gz
"

sleep 5

docker exec -it cli-org1 sh -c 'export PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep Package | sed -e "s/.*Package ID: \(.*\), Label:.*/\1/") \
&& peer lifecycle chaincode approveformyorg --orderer orderer1-org0:'"$ORDERER1_ORG0_PORT"' --tls --cafile /tmp/hyperledger/org1/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem --channelID mychannel --name mycc -v 0 --package-id $PACKAGE_ID --sequence 1
'

infoln "Install, Approve and Commit Chaincode"
infoln "Org2"

docker exec -it cli-org2 sh -c "export CORE_PEER_ADDRESS=peer1-org2:$PEER1_ORG2_PORT \
&& peer lifecycle chaincode package cp.tar.gz --lang node --path /opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode --label cp_0 \
&& peer lifecycle chaincode install cp.tar.gz \
&& export CORE_PEER_ADDRESS=peer2-org2:$PEER2_ORG2_PORT \
&& peer lifecycle chaincode install cp.tar.gz
"

sleep 5

docker exec -it cli-org2 sh -c 'export PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep Package | sed -e "s/.*Package ID: \(.*\), Label:.*/\1/") \
&& peer lifecycle chaincode approveformyorg --orderer orderer1-org0:'"$ORDERER1_ORG0_PORT"' --tls --cafile /tmp/hyperledger/org2/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem --channelID mychannel --name mycc -v 0 --package-id $PACKAGE_ID --sequence 1 \
&& peer lifecycle chaincode commit -o orderer1-org0:'"$ORDERER1_ORG0_PORT"' --peerAddresses peer1-org2:'"$PEER1_ORG2_PORT"' --tlsRootCertFiles /tmp/hyperledger/org2/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem --peerAddresses peer2-org2:'"$PEER2_ORG2_PORT"' --tlsRootCertFiles /tmp/hyperledger/org2/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem --channelID mychannel --name mycc -v 0 --sequence 1 --tls --cafile /tmp/hyperledger/org2/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem --waitForEvent
'

infoln "Test Chaincode from Org1"
docker exec -it cli-org1 sh -c "peer chaincode invoke -C mychannel -n mycc -c '{\"Args\":[\"addProduct\",\"x\",\"50.4\",\"kg\", \"\", \"{}\", \"[]\", \"{}\"]}' --tls --cafile /tmp/hyperledger/org1/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem
"

infoln "Test Chaincode from Org2"
docker exec -it cli-org2 sh -c "peer chaincode invoke -C mychannel -n mycc -c '{\"Args\":[\"addProduct\",\"x\",\"50.4\",\"kg\", \"\", \"{}\", \"[]\", \"{}\"]}' --tls --cafile /tmp/hyperledger/org2/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem
"

echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\n",$0;}' /tmp/hyperledger/org1/msp/tlscacerts/tls-ca-cert.pem`" > tls-ca-cert.pem
echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\n",$0;}' /tmp/hyperledger/org1/msp/cacerts/ca-cert.pem`" > ca-cert.pem