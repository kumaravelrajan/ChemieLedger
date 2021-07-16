# Overview of blockchain network 
The blockchain network can be setup using the given scripts in this repo. We recognize the need for a consortium blockchain network to be flexible as new organizations may always want to join the consortium. For this purpose, we offer the following types of blockchain network deployments:- 

1. **Base network**:
  Simulates a scenario where two organizations build a consortium, create a new blockchain network and set up a channel.

2. **Base network + new organisation Org3**:
  Simulates a scenario where two organizations build a consortium, create a new blockchain network and set up a channel. Later, a new organisation "Org3" joins the network and the channel, after being approved by the other organizations. 

# Base network 
- **Startup script:** Fabric-Prod-Nw/Main-Docker-Compose/start.sh
- **Participants:**
  - Peer orgnizations = 2 (org1 and org2)
  - Orderer organizations = 1 (org0)
- **Tool used for certificate generation:** Fabric CA
  - Each organization (peer and orderer orgs) has its own organization CA
  - All organizations share the same TLS CA server. The TLS CA is used to encrypt communication between the fabric network nodes.

# Base network + new organisation Org3
- **Startup script:** Fabric-Prod-Nw/Org3/startOrg3.sh
- **Participants:**
  - Peer organizations = 3 (Org1, Org2, Org3)
  - Orderer organizations = 1 (Org0)
- **Tool used for certificate generation:** Fabric CA
  - Each organization (peer and orderer orgs) has its own organization CA
  - All organizations share the same TLS CA server. The TLS CA is used to encrypt communication between the fabric network nodes.

# Fabric CA:
The tool used to generated peer and user identities is Fabric-CA which is used in production environments and not cryptogen which is used for testing purposes. The certificate issuance process has 2 steps: registration and enrollment. They are discussed below for further clarity.

- **Need for 2 step process (registration and enrollment):**
  While it is possible for the admin of a CA to create an identity and give the public/private key pair to a user out of band, this process would give the CA admin access to the private key of every user. Such an arrangement violates basic security procedures regarding the security of private keys, which should not be exposed for any reason.This is why the registration process handled by the CA admins and the enrollment process handled by the respective users are separated. 

  - **Registration:**
    Registration is a process in which the CA admin gives an enroll ID and secret (these are similar to a username and password) to an identity, assigns it a role and any required attributes and registers the identity with the CA it is an admin of. The CA admin then gives this enroll ID and secret to the ultimate user of the identity. 

  - **Enrollment:**
    The user after receiving the enroll ID and secret from the CA admin executes a Fabric CA client enroll command, returning the public/private key pair containing the role and attributes assigned by the CA admin.

This 2 step process preserves both the integrity of the CA (because only CA admins can register users and assign roles and affiliations) and private keys (since only the user of an identity will have access to them).
    
- **Difference in registering admins and peers:**
While admin identities only need to be registered and enrolled with an “organization CA” that generates identity certificates for both admins and nodes alike, nodes must also be registered and enrolled with a TLS CA. This will create a public/private TLS key pair that nodes use to sign and encrypt their communications.

# File transfer
It is important to note, that the transfer of certificates and configurations files was heavily simplified in this prototype network. In a real production environment, different organizations won't be sharing one filesystem to store their files like they do here but instead, exchange them out-of-band. Suitable out-of-band exchange methods could be E-Mail, USB Flashdrive, FTPS, Cloud storage, or setting up a shared Docker volume.
The exchange of the following files would need to happen out-of-band in a real world production environment:

- **TLS CA**
Each organization would have its own TLS CA, instead of a global one.
Thus, you as an organization will have to transfer your CA's certificate out-of-band with organizations that will validate your TLS certificate.
Respective file:
  - `/tmp/hyperledger/tls-ca/crypto/ca-cert.pem`

- **Root CA**
Generally, you would have to exchange your organization's trusted root certificate out-of-band with all your organization's hosts that weren't enrolled yet.
Respective files:
  - `/tmp/hyperledger/org0/ca/crypto/ca-cert.pem`
  - `/tmp/hyperledger/org1/ca/crypto/ca-cert.pem`
  - `/tmp/hyperledger/org2/ca/crypto/ca-cert.pem`
  - `/tmp/hyperledger/org3/ca/crypto/ca-cert.pem`

- **Admin MSP**
Each organization enrolls an admin MSP, who is responsible for installing and instantiating chaincode. You will have to exchange your admin certificate with your other peer machines out-of-band.
Respective files:
  - `/tmp/hyperledger/org0/admin/msp/cacerts/ca-cert.pem`
  - `/tmp/hyperledger/org1/admin/msp/cacerts/ca-cert.pem`
  - `/tmp/hyperledger/org2/admin/msp/cacerts/ca-cert.pem`
  - `/tmp/hyperledger/org3/admin/msp/cacerts/ca-cert.pem`

- **Channel creation**
During a channel creation, a `channel.tx` artifact is generated on the orderer. This file needs to be transferred out-of-band to one peer of each organization that wishes to join the channel.
The peers will use this to create the genesis block of the channel `mychannel.block`.
This genesis block needs then to be transferred to the rest of the organization's peers out-of-band.
Respective file:
  - `/tmp/hyperledger/org0/orderer/channel.tx`
  - `/tmp/hyperledger/org1/peer1/assets/mychannel.block`
  - `/tmp/hyperledger/org2/peer1/assets/mychannel.block`
  - `/tmp/hyperledger/org3/peer1/assets/mychannel.block`

- **Updating Channel configuration**
When a new organizations wants to join an existing channel, the channel configuration file needs to be updated. For this, a channel member organization has to send the latest channel configuration file to the joining organization out-of-band.
Respective file:
  - `/tmp/hyperledger/org1/peer1/assets/mychannel.pb`
The joining organization updates the channel configuration file by including their organization definition and then returns it out-of-band for the channel member organizations to sign the new configuration.
Respective file:
  - `/tmp/hyperledger/org3/peer1/assets/org3_update_in_envelope.pb`
After an organization has signed the new configuration file, they need to exchange it out-of-band with the other channel member organization for signing. 
Respective file:
  - `/tmp/hyperledger/org1/peer1/assets/org3_update_in_envelope.pb"`

# Requirements
The following system requirements need to be installed to run the scripts:
- Linux OS, e.g. Ubuntu 18.4
- Docker version 17.06.2-ce or greater
- Docker Compose version 1.14.0 or greater
- Node version 12.16.1
- npm version 6.4.1 or greater

# Running the scripts

**Note:** The two scripts have to be started from within their respective directories. The scripts have to be run as the root user of the system. Also note that at the beginning of each script, it **cleans up** any previously running network and files associated with it. 

To start the base network alone, run the following command:
```bash
cd Fabric-Prod-Nw/Base-Network/
sudo ./start.sh
```
To start the base network and then to add organization 3 to the channel, run the following command: 
```bash
cd Fabric-Prod-Nw/Org3/
sudo ./startOrg3.sh
```
To manually clean the base network, run the following command:
```bash
cd Fabric-Prod-Nw/Base-Network/
sudo ./cleanup.sh
```
To manually clean the base network together with Org3, run the following command:
```bash
cd Fabric-Prod-Nw/Org3/
sudo ./cleanup.sh
```

# Customization
It is possible to customize the Port settings of the base network by editing the respective variables in `env.sh`
Additionally, the Port settings, as well as the number of peers the new organisation Org3 has, can be customized by editing the following line:
```bash
declare -a PEER_PORTS_ORG3=('12051' '13051' '14051' '15051')
```
Any new String number entered will create an additional peer. 
At last, the info lines and script tracing can be turned on and off by editing the following variable:
```bash
SILENCE_INFOLN_AND_SCRIPT_TRACING=true
```

# Troubleshoot
**Device or ressource busy**

When running the `cleanup.sh` script (standalone or a the beginning of `start.sh` \ `startOrg3.sh`), it can occur that it fails to remove a directory.

**Solution**

Restart Docker:
- Docker installed on Linux:
```bash
service docker restart
```
- Docker-Desktop installed on Windows (used as Backend for a Linux distro on WSL 2):
1. Right click the Docker-Desktop icon in your task bar.
2. Select "Restart Docker..." option
