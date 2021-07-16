#!/bin/bash
. ../env.sh

infoln "array PEER_PORTS_ORG3=${PEER_PORTS_ORG3[@]}"
infoln "Number of entries in PEER_PORTS_ORG3=${#PEER_PORTS_ORG3[@]}"

I=1
PEER1_ORG3_PORT=0
for CURRENT_PEER_PORT_ORG3 in ${PEER_PORTS_ORG3[@]}
do
    if [ $I -eq 1 ]
    then
        PEER1_ORG3_PORT=$CURRENT_PEER_PORT_ORG3
        cat <<EOT >> ./docker-compose.yml
version: '2'

networks:
    fabric-ca:
        name: fabric-ca

services:
    rca-org3:
        container_name: rca-org3
        image: hyperledger/fabric-ca:1.5.0
        command: sh -c 'fabric-ca-server start -d -b rca-org3-admin:rca-org3-adminpw --port 7056'
        environment:
            - FABRIC_CA_SERVER_HOME=/tmp/hyperledger/fabric-ca/crypto
            - FABRIC_CA_SERVER_TLS_ENABLED=true
            - FABRIC_CA_SERVER_CSR_CN=rca-org3
            - FABRIC_CA_SERVER_CSR_HOSTS=0.0.0.0
            - FABRIC_CA_SERVER_DEBUG=true
            - FABRIC_CA_SERVER_CA_NAME=rca-org3
        volumes:
            - /tmp/hyperledger/org3/ca:/tmp/hyperledger/fabric-ca
        networks:
            - fabric-ca
        ports:
            - 7056:7056

    peer1-org3:
        container_name: peer1-org3
        image: hyperledger/fabric-peer:2.3
        environment:
            - CORE_PEER_ID=peer1-org3
            - CORE_PEER_ADDRESS=peer1-org3:$CURRENT_PEER_PORT_ORG3
            - CORE_PEER_LISTENADDRESS=0.0.0.0:$CURRENT_PEER_PORT_ORG3
            - CORE_PEER_CHAINCODEADDRESS=peer1-org3:$((CURRENT_PEER_PORT_ORG3+1))
            - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:$((CURRENT_PEER_PORT_ORG3+1))
            - CORE_PEER_LOCALMSPID=org3MSP
            - CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/peer1/msp
            - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
            - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=fabric-ca
            - FABRIC_LOGGING_SPEC=debug
            - CORE_PEER_TLS_ENABLED=true
            - CORE_PEER_TLS_CERT_FILE=/tmp/hyperledger/org3/peer1/tls-msp/signcerts/cert.pem
            - CORE_PEER_TLS_KEY_FILE=/tmp/hyperledger/org3/peer1/tls-msp/keystore/key.pem
            - CORE_PEER_TLS_ROOTCERT_FILE=/tmp/hyperledger/org3/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem
            - CORE_PEER_GOSSIP_USELEADERELECTION=true
            - CORE_PEER_GOSSIP_ORGLEADER=false
            - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer1-org3:$CURRENT_PEER_PORT_ORG3
            - CORE_PEER_GOSSIP_SKIPHANDSHAKE=true
        working_dir: /opt/gopath/src/github.com/hyperledger/fabric/org3/peer1
        volumes:
            - /var/run:/host/var/run
            - /tmp/hyperledger/org3/peer1:/tmp/hyperledger/org3/peer1
        networks:
            - fabric-ca
        ports:
        - $CURRENT_PEER_PORT_ORG3:$CURRENT_PEER_PORT_ORG3

    cli-org3:
        container_name: cli-org3
        image: hyperledger/fabric-tools:2.3
        tty: true
        stdin_open: true
        environment:
            - GOPATH=/opt/gopath
            - FABRIC_LOGGING_SPEC=DEBUG
            - CORE_PEER_ID=cli
            - CORE_PEER_ADDRESS=peer1-org3:$CURRENT_PEER_PORT_ORG3
            - CORE_PEER_LOCALMSPID=org3MSP
            - CORE_PEER_TLS_ENABLED=true
            - CORE_PEER_TLS_ROOTCERT_FILE=/tmp/hyperledger/org3/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem
            - CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/admin/msp
        working_dir: /opt/gopath/src/github.com/hyperledger/fabric/org3
        command: sh
        volumes:
            - /tmp/hyperledger/org3:/tmp/hyperledger/org3
            - /tmp/hyperledger/org3/peer1/assets/chaincode:/opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode
            - /tmp/hyperledger/org3/admin:/tmp/hyperledger/org3/admin
        networks:
            - fabric-ca          

EOT
        I=$((I+1))
    else
        cat <<EOT >> ./docker-compose.yml
    peer$I-org3:
        container_name: peer$I-org3
        image: hyperledger/fabric-peer:2.3
        environment:
            - CORE_PEER_ID=peer$I-org3
            - CORE_PEER_ADDRESS=peer$I-org3:$CURRENT_PEER_PORT_ORG3
            - CORE_PEER_LISTENADDRESS=0.0.0.0:$CURRENT_PEER_PORT_ORG3
            - CORE_PEER_CHAINCODEADDRESS=peer1-org3:$((CURRENT_PEER_PORT_ORG3+1))
            - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:$((CURRENT_PEER_PORT_ORG3+1))
            - CORE_PEER_LOCALMSPID=org3MSP
            - CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/peer$I/msp
            - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
            - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=fabric-ca
            - FABRIC_LOGGING_SPEC=grpc=debug:info
            - CORE_PEER_TLS_ENABLED=true
            - CORE_PEER_TLS_CERT_FILE=/tmp/hyperledger/org3/peer$I/tls-msp/signcerts/cert.pem
            - CORE_PEER_TLS_KEY_FILE=/tmp/hyperledger/org3/peer$I/tls-msp/keystore/key.pem
            - CORE_PEER_TLS_ROOTCERT_FILE=/tmp/hyperledger/org3/peer$I/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem
            - CORE_PEER_GOSSIP_USELEADERELECTION=true
            - CORE_PEER_GOSSIP_ORGLEADER=false
            - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer$I-org3:$CURRENT_PEER_PORT_ORG3
            - CORE_PEER_GOSSIP_SKIPHANDSHAKE=true
            - CORE_PEER_GOSSIP_BOOTSTRAP=peer1-org3:$PEER1_ORG3_PORT
        working_dir: /opt/gopath/src/github.com/hyperledger/fabric/org3/peer2
        volumes:
            - /var/run:/host/var/run
            - /tmp/hyperledger/org3/peer$I:/tmp/hyperledger/org3/peer$I
        networks:
            - fabric-ca
        ports:
        - $CURRENT_PEER_PORT_ORG3:$CURRENT_PEER_PORT_ORG3      

EOT
        I=$((I+1))
    fi
done