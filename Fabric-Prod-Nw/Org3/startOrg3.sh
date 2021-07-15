#!/bin/bash

set -e

# Import env.sh
. ../env.sh

if [ "$SILENCE_INFOLN_AND_SCRIPT_TRACING"=false ]
then
  set -o xtrace
fi

# println echos string
function println() {
  echo -e "$1"
}

C_YELLOW='\033[1;33m'
C_RESET='\033[0m'
function infoln() {
    if [ "$SILENCE_INFOLN_AND_SCRIPT_TRACING"=false ]
    then
      set +x
      println "${C_YELLOW}*****************************************${C_RESET}"
      println "${C_YELLOW} --------> ${1}${C_RESET}"
      println "${C_YELLOW}*****************************************${C_RESET}"
      set -x
    fi
}

infoln "Starting base network before adding org3"
ORG3PATH=$PWD
cd ../Base-Network/
./start.sh
cd $ORG3PATH
infoln "Base network created successfully. Adding org3 to network now.."

infoln "Removing Org3 docker compose and configtx.yaml file if present"
./cleanup.sh

infoln "Create custom docker-compose file"
. ./scripts/CreateDockerCompose.sh

infoln "Create custom configtx.yml file"
. ./scripts/CreateConfigTx.sh

# infoln "array PEER_PORTS_ORG3=${PEER_PORTS_ORG3[@]}"
# infoln "Number of entries in PEER_PORTS_ORG3=${#PEER_PORTS_ORG3[@]}"

# Export path of bin files
export PATH=${PWD}/../Fabric-bin:$PATH

infoln "Registering Org3 peers with TLS CA"
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/tls-ca/crypto/ca-cert.pem
export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/tls-ca/admin
I=0
while [ $I -lt ${#PEER_PORTS_ORG3[@]} ]
do
  infoln "Registering peer$((I+1))-org3"
  fabric-ca-client register -d --id.name peer$((I+1))-org3 --id.secret peer$((I+1))PW --id.type peer -u https://0.0.0.0:7052
  I=$((I+1))
done

infoln "Setup Org3’s CA"
docker-compose up -d rca-org3
sleep 5

infoln "Enroll Org3’s CA Admin"
export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org3/ca/crypto/ca-cert.pem
export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org3/ca/admin
fabric-ca-client enroll -d -u https://rca-org3-admin:rca-org3-adminpw@0.0.0.0:7056
I=0
while [ $I -lt ${#PEER_PORTS_ORG3[@]} ]
do
  infoln "Registering peer$((I+1))-org3"
  fabric-ca-client register -d --id.name peer$((I+1))-org3 --id.secret peer$((I+1))PW --id.type peer -u https://0.0.0.0:7056
  I=$((I+1))
done
fabric-ca-client register -d --id.name admin-org3 --id.secret org3AdminPW --id.type admin -u https://0.0.0.0:7056
fabric-ca-client register -d --id.name user-org3 --id.secret org3UserPW --id.type user -u https://0.0.0.0:7056

infoln "Setup Org3’s Peers"
I=0
while [ $I -lt ${#PEER_PORTS_ORG3[@]} ]
do
  mkdir -p /tmp/hyperledger/org3/peer$((I+1))/assets/ca

  cp /tmp/hyperledger/org3/ca/crypto/ca-cert.pem /tmp/hyperledger/org3/peer$((I+1))/assets/ca/ca-cert.pem

  # Enroll Peers against Org3 CA
  export FABRIC_CA_CLIENT_HOME=/tmp/hyperledger/org3/peer$((I+1))
  export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org3/peer$((I+1))/assets/ca/ca-cert.pem
  export FABRIC_CA_CLIENT_MSPDIR=msp
  fabric-ca-client enroll -d -u https://peer$((I+1))-org3:peer$((I+1))PW@0.0.0.0:7056

  #Enroll Peer 1 against TLS CA
  mkdir -p /tmp/hyperledger/org3/peer$((I+1))/assets/tls-ca
  cp /tmp/hyperledger/tls-ca/crypto/ca-cert.pem /tmp/hyperledger/org3/peer$((I+1))/assets/tls-ca/tls-ca-cert.pem

  export FABRIC_CA_CLIENT_MSPDIR=tls-msp
  export FABRIC_CA_CLIENT_TLS_CERTFILES=/tmp/hyperledger/org3/peer$((I+1))/assets/tls-ca/tls-ca-cert.pem
  fabric-ca-client enroll -d -u https://peer$((I+1))-org3:peer$((I+1))PW@0.0.0.0:7052 --enrollment.profile tls --csr.hosts peer$((I+1))-org3
  #Change name of key to key.pem
  mv /tmp/hyperledger/org3/peer$((I+1))/tls-msp/keystore/* /tmp/hyperledger/org3/peer$((I+1))/tls-msp/keystore/key.pem
  I=$((I+1))
done

infoln "Enroll Org3's Admin"
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

I=0
while [ $I -lt ${#PEER_PORTS_ORG3[@]} ]
do
  cp /tmp/hyperledger/org3/msp/config.yaml /tmp/hyperledger/org3/peer$((I+1))/msp/
  mv /tmp/hyperledger/org3/peer$((I+1))/msp/cacerts/* /tmp/hyperledger/org3/peer$((I+1))/msp/cacerts/ca-cert.pem
  I=$((I+1))
done

cp /tmp/hyperledger/org3/msp/config.yaml /tmp/hyperledger/org3/admin/msp/
mv /tmp/hyperledger/org3/admin/msp/cacerts/* /tmp/hyperledger/org3/admin/msp/cacerts/ca-cert.pem

# Moving certificates to org3/msp
mkdir -p /tmp/hyperledger/org3/msp/cacerts
cp /tmp/hyperledger/org3/ca/crypto/ca-cert.pem /tmp/hyperledger/org3/msp/cacerts/ca-cert.pem
mkdir -p /tmp/hyperledger/org3/msp/tlscacerts
cp /tmp/hyperledger/tls-ca/crypto/ca-cert.pem /tmp/hyperledger/org3/msp/tlscacerts/tls-ca-cert.pem

infoln "Launch Org3’s Peers"
I=0
while [ $I -lt ${#PEER_PORTS_ORG3[@]} ]
do
  docker-compose up -d peer$((I+1))-org3
  I=$((I+1))
done


infoln "Print org3 org definition"
configtxgen -printOrg org3 > /tmp/hyperledger/org3/peer1/assets/org3.json

infoln "Fetch existing Channel configuration"
infoln "Operating as Org1 admin from cli-org1"
docker exec -it cli-org1 sh -c 'export CORE_PEER_TLS_ENABLED=true \
&& export CORE_PEER_LOCALMSPID="org1MSP" \
&& export CORE_PEER_TLS_ROOTCERT_FILE=/tmp/hyperledger/org1/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem \
&& export CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org1/admin/msp \
&& export CORE_PEER_ADDRESS=peer1-org1:7051 \
&& peer channel fetch config /tmp/hyperledger/org1/peer1/assets/mychannel.pb -o orderer1-org0:'"$ORDERER1_ORG0_PORT"' -c mychannel --tls --cafile "/tmp/hyperledger/org1/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem"'

sleep 5

infoln "Successfully fetched latest configuration block"

infoln "Converting configuration block to JSON"
# Requires jq tool https://stedolan.github.io/jq/
mv /tmp/hyperledger/org1/peer1/assets/mychannel.pb /tmp/hyperledger/org3/peer1/assets/mychannel.pb
cd /tmp/hyperledger/org3/peer1/assets
configtxlator proto_decode --input mychannel.pb --type common.Block --output mychannel_config_block.json
jq .data.data[0].payload.data.config mychannel_config_block.json > mychannel_config.json

# Append Org3 config definition to channel's application groups field
# ToDO locate org3 config and insert below
# Requires yq https://kislyuk.github.io/yq/ (wrapper of jq tool for yaml files)
jq -s '.[0] * {"channel_group":{"groups":{"Application":{"groups": {"org3":.[1]}}}}}' mychannel_config.json /tmp/hyperledger/org3/peer1/assets/org3.json > modified_config.json

infoln "Add new Org Crypto Material"
configtxlator proto_encode --input mychannel_config.json --type common.Config --output mychannel_config.pb
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
configtxlator compute_update --channel_id mychannel --original mychannel_config.pb --updated modified_config.pb --output org3_update.pb
configtxlator proto_decode --input org3_update.pb --type common.ConfigUpdate --output org3_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"'mychannel'", "type":2}},"data":{"config_update":'$(cat org3_update.json)'}}}' | jq . > org3_update_in_envelope.json
configtxlator proto_encode --input org3_update_in_envelope.json --type common.Envelope --output org3_update_in_envelope.pb

infoln "Sign and Submit the Config Update"
infoln "Org1 admin sign..."
# ToDo may need to adjust path
cp /tmp/hyperledger/org3/peer1/assets/org3_update_in_envelope.pb /tmp/hyperledger/org1/peer1/assets/org3_update_in_envelope.pb
docker exec -it cli-org1 sh -c "peer channel signconfigtx -f /tmp/hyperledger/org1/peer1/assets/org3_update_in_envelope.pb"
sleep 5

infoln "Org2 admin sign..."
cp /tmp/hyperledger/org1/peer1/assets/org3_update_in_envelope.pb /tmp/hyperledger/org2/peer1/assets/org3_update_in_envelope.pb

docker exec -it cli-org2 sh -c 'export CORE_PEER_TLS_ENABLED=true \
&& export CORE_PEER_LOCALMSPID="org2MSP" \
&& export CORE_PEER_TLS_ROOTCERT_FILE=/tmp/hyperledger/org2/peer1/assets/tls-ca/tls-ca-cert.pem \
&& export CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org2/admin/msp \
&& export CORE_PEER_ADDRESS=peer1-org2:7051 \
&& peer channel update -f /tmp/hyperledger/org2/peer1/assets/org3_update_in_envelope.pb -c mychannel -o orderer1-org0:'"$ORDERER1_ORG0_PORT"' --tls --cafile /tmp/hyperledger/org2/peer1/assets/tls-ca/tls-ca-cert.pem'
sleep 5

infoln "Channel update of org3 successful."

# Change back to /FabricProdNw/Org3/
cd $ORG3PATH

infoln "Create org3 CLI Container"
docker-compose up -d cli-org3
sleep 5

infoln "Org3 Join Channel"

infoln "peer1-org3 and peer2-org3 joining channel"

I=0
while [ $I -lt ${#PEER_PORTS_ORG3[@]} ]
do
  if [ $I -eq 0 ]
  then
    docker exec -it cli-org3 sh -c 'export CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/admin/msp \
    && export CORE_PEER_TLS_ENABLED=true \
    && export CORE_PEER_LOCALMSPID="org3MSP" \
    && export CORE_PEER_TLS_ROOTCERT_FILE=/tmp/hyperledger/org3/peer1/assets/tls-ca/tls-ca-cert.pem \
    && export CORE_PEER_ADDRESS='"peer$((I+1))"'-org3:'"${PEER_PORTS_ORG3[$I]}"' \
    && peer channel fetch 0 /tmp/hyperledger/org3/peer1/assets/mychannel.block -o orderer1-org0:'"$ORDERER1_ORG0_PORT"' -c mychannel --tls --cafile /tmp/hyperledger/org3/peer1/assets/tls-ca/tls-ca-cert.pem \
    && peer channel join -b /tmp/hyperledger/org3/peer1/assets/mychannel.block \'
  else
    docker exec -it cli-org3 sh -c 'export CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/admin/msp \
    && export CORE_PEER_TLS_ENABLED=true \
    && export CORE_PEER_LOCALMSPID="org3MSP" \
    && export CORE_PEER_TLS_ROOTCERT_FILE=/tmp/hyperledger/org3/peer1/assets/tls-ca/tls-ca-cert.pem \
    && export CORE_PEER_ADDRESS='"peer$((I+1))"'-org3:'"${PEER_PORTS_ORG3[$I]}"' \
    && peer channel join -b /tmp/hyperledger/org3/peer1/assets/mychannel.block \'
  fi

  I=$((I+1))
done

infoln "Install and Approve Chaincode"
infoln "Org3"
rsync -a --exclude=node_modules/ ../chaincode /tmp/hyperledger/org3/peer1/assets/

I=0
while [ $I -lt ${#PEER_PORTS_ORG3[@]} ]
do
  docker exec -it cli-org3 sh -c "export CORE_PEER_ADDRESS=peer$((I+1))-org3:${PEER_PORTS_ORG3[$I]} \
  && export CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/admin/msp \
  && peer lifecycle chaincode package cp.tar.gz --lang node --path /opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode --label cp_0 \
  && peer lifecycle chaincode install cp.tar.gz \
  "

  I=$((I+1))
done

sleep 10

docker exec -it cli-org3 sh -c 'export CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/admin/msp \
&& export PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep Package | sed -e "s/.*Package ID: \(.*\), Label:.*/\1/") \
&& peer lifecycle chaincode approveformyorg --orderer orderer1-org0:'"$ORDERER1_ORG0_PORT"' --tls --cafile /tmp/hyperledger/org3/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem --channelID mychannel --name mycc -v 0 --package-id $PACKAGE_ID --sequence 1
'

infoln "Test Chaincode from Org3"
docker exec -it cli-org3 sh -c "export CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/admin/msp \
&& peer chaincode invoke -C mychannel -n mycc -c '{\"Args\":[\"addProduct\",\"x\",\"36.0\",\"kg\", \"\", \"{}\", \"[]\", \"{}\"]}' --tls --cafile /tmp/hyperledger/org3/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem
"