#!/bin/bash
. ../env.sh
cat <<EOT >> ./docker-compose.yml
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
            - CORE_PEER_ADDRESS=peer1-org3:$PEER1_ORG3_PORT
            - CORE_PEER_LISTENADDRESS=0.0.0.0:$PEER1_ORG3_PORT
            - CORE_PEER_CHAINCODEADDRESS=peer1-org1:$((PEER1_ORG3_PORT+1))
            - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:$((PEER1_ORG3_PORT+1))
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
            - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer1-org3:$PEER1_ORG3_PORT
            - CORE_PEER_GOSSIP_SKIPHANDSHAKE=true
        working_dir: /opt/gopath/src/github.com/hyperledger/fabric/org3/peer1
        volumes:
            - /var/run:/host/var/run
            - /tmp/hyperledger/org3/peer1:/tmp/hyperledger/org3/peer1
        networks:
            - fabric-ca
        ports:
         - $PEER1_ORG3_PORT:$PEER1_ORG3_PORT

    peer2-org3:
        container_name: peer2-org3
        image: hyperledger/fabric-peer:2.3
        environment:
            - CORE_PEER_ID=peer2-org3
            - CORE_PEER_ADDRESS=peer2-org3:$PEER2_ORG3_PORT
            - CORE_PEER_LISTENADDRESS=0.0.0.0:$PEER2_ORG3_PORT
            - CORE_PEER_CHAINCODEADDRESS=peer1-org1:$((PEER2_ORG3_PORT+1))
            - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:$((PEER2_ORG3_PORT+1))
            - CORE_PEER_LOCALMSPID=org3MSP
            - CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/peer2/msp
            - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
            - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=fabric-ca
            - FABRIC_LOGGING_SPEC=grpc=debug:info
            - CORE_PEER_TLS_ENABLED=true
            - CORE_PEER_TLS_CERT_FILE=/tmp/hyperledger/org3/peer2/tls-msp/signcerts/cert.pem
            - CORE_PEER_TLS_KEY_FILE=/tmp/hyperledger/org3/peer2/tls-msp/keystore/key.pem
            - CORE_PEER_TLS_ROOTCERT_FILE=/tmp/hyperledger/org3/peer2/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem
            - CORE_PEER_GOSSIP_USELEADERELECTION=true
            - CORE_PEER_GOSSIP_ORGLEADER=false
            - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer2-org3:$PEER2_ORG3_PORT
            - CORE_PEER_GOSSIP_SKIPHANDSHAKE=true
            - CORE_PEER_GOSSIP_BOOTSTRAP=peer1-org3:$PEER1_ORG3_PORT
        working_dir: /opt/gopath/src/github.com/hyperledger/fabric/org3/peer2
        volumes:
            - /var/run:/host/var/run
            - /tmp/hyperledger/org3/peer2:/tmp/hyperledger/org3/peer2
        networks:
            - fabric-ca
        ports:
         - $PEER2_ORG3_PORT:$PEER2_ORG3_PORT

    cli-org3:
        container_name: cli-org3
        image: hyperledger/fabric-tools:2.3
        tty: true
        stdin_open: true
        environment:
            - GOPATH=/opt/gopath
            - FABRIC_LOGGING_SPEC=DEBUG
            - CORE_PEER_ID=cli
            - CORE_PEER_ADDRESS=peer1-org3:$PEER1_ORG3_PORT
            - CORE_PEER_LOCALMSPID=org3MSP
            - CORE_PEER_TLS_ENABLED=true
            - CORE_PEER_TLS_ROOTCERT_FILE=/tmp/hyperledger/org3/peer1/tls-msp/tlscacerts/tls-0-0-0-0-7052.pem
            - CORE_PEER_MSPCONFIGPATH=/tmp/hyperledger/org3/peer1/msp
        working_dir: /opt/gopath/src/github.com/hyperledger/fabric/org3
        command: sh
        volumes:
            - /tmp/hyperledger/org3/peer1:/tmp/hyperledger/org3/peer1
            - /tmp/hyperledger/org3/peer1/assets/chaincode:/opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode
            - /tmp/hyperledger/org3/admin:/tmp/hyperledger/org3/admin
        networks:
            - fabric-ca
EOT