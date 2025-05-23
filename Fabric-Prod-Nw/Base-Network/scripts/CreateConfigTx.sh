#!/bin/bash
. ../env.sh
cat <<EOT >> ./configtx.yaml
################################################################################
#
#   Section: Organizations
#
#   - This section defines the different organizational identities which will
#   be referenced later in the configuration.
#
################################################################################
Organizations:

- &org0

   Name: org0

   # ID to load the MSP definition as
   ID: org0MSP

   # MSPDir is the filesystem path which contains the MSP configuration
   MSPDir: /tmp/hyperledger/org0/msp

   # Policies defines the set of policies at this level of the config tree
   # For organization policies, their canonical path is usually
   #   /Channel/<Application|Orderer>/<OrgName>/<PolicyName>
   Policies:
      Readers:
         Type: Signature
         Rule: "OR('org0MSP.member')"
      Writers:
         Type: Signature
         Rule: "OR('org0MSP.member')"
      Admins:
         Type: Signature
         Rule: "OR('org0MSP.admin')"

- &org1

   Name: org1

   # ID to load the MSP definition as
   ID: org1MSP

   # MSPDir is the filesystem path which contains the MSP configuration
   MSPDir: /tmp/hyperledger/org1/msp

   AnchorPeers:
      # AnchorPeers defines the location of peers which can be used
      # for cross org gossip communication.  Note, this value is only
      # encoded in the genesis block in the Application section context
      - Host: peer1-org1
        Port: $PEER1_ORG1_PORT

   # Policies defines the set of policies at this level of the config tree
   # For organization policies, their canonical path is usually
   #   /Channel/<Application|Orderer>/<OrgName>/<PolicyName>
   Policies:
      Readers:
            Type: Signature
            Rule: "OR('org1MSP.admin', 'org1MSP.peer', 'org1MSP.client', 'org1MSP.member')"
      Writers:
            Type: Signature
            Rule: "OR('org1MSP.admin', 'org1MSP.client', 'org1MSP.member')"
      Admins:
            Type: Signature
            Rule: "OR('org1MSP.admin')"
      Endorsement:
            Type: Signature
            Rule: "OR('org1MSP.peer', 'org1MSP.admin')"

- &org2

   Name: org2

   # ID to load the MSP definition as
   ID: org2MSP

   # MSPDir is the filesystem path which contains the MSP configuration
   MSPDir: /tmp/hyperledger/org2/msp

   AnchorPeers:
      # AnchorPeers defines the location of peers which can be used
      # for cross org gossip communication.  Note, this value is only
      # encoded in the genesis block in the Application section context
      - Host: peer1-org2
        Port: $PEER1_ORG2_PORT
        
   # Policies defines the set of policies at this level of the config tree
   # For organization policies, their canonical path is usually
   #   /Channel/<Application|Orderer>/<OrgName>/<PolicyName>
   Policies:
            Readers:
                Type: Signature
                Rule: "OR('org2MSP.admin', 'org2MSP.peer', 'org2MSP.client', 'org2MSP.member')"
            Writers:
                Type: Signature
                Rule: "OR('org2MSP.admin', 'org2MSP.client', 'org2MSP.member')"
            Admins:
                Type: Signature
                Rule: "OR('org2MSP.admin')"
            Endorsement:
                Type: Signature
                Rule: "OR('org2MSP.peer', 'org2MSP.admin')"

################################################################################
#
#   SECTION: Capabilities
#
#   - This section defines the capabilities of fabric network. This is a new
#   concept as of v1.1.0 and should not be utilized in mixed networks with
#   v1.0.x peers and orderers.  Capabilities define features which must be
#   present in a fabric binary for that binary to safely participate in the
#   fabric network.  For instance, if a new MSP type is added, newer binaries
#   might recognize and validate the signatures from this type, while older
#   binaries without this support would be unable to validate those
#   transactions.  This could lead to different versions of the fabric binaries
#   having different world states.  Instead, defining a capability for a channel
#   informs those binaries without this capability that they must cease
#   processing transactions until they have been upgraded.  For v1.0.x if any
#   capabilities are defined (including a map with all capabilities turned off)
#   then the v1.0.x peer will deliberately crash.
#
################################################################################
Capabilities:
    # Channel capabilities apply to both the orderers and the peers and must be
    # supported by both.
    # Set the value of the capability to true to require it.
    Channel: &ChannelCapabilities
        # V2_0 capability ensures that orderers and peers behave according
        # to v2.0 channel capabilities. Orderers and peers from
        # prior releases would behave in an incompatible way, and are therefore
        # not able to participate in channels at v2.0 capability.
        # Prior to enabling V2.0 channel capabilities, ensure that all
        # orderers and peers on a channel are at v2.0.0 or later.
        V2_0: true

    # Orderer capabilities apply only to the orderers, and may be safely
    # used with prior release peers.
    # Set the value of the capability to true to require it.
    Orderer: &OrdererCapabilities
        # V2_0 orderer capability ensures that orderers behave according
        # to v2.0 orderer capabilities. Orderers from
        # prior releases would behave in an incompatible way, and are therefore
        # not able to participate in channels at v2.0 orderer capability.
        # Prior to enabling V2.0 orderer capabilities, ensure that all
        # orderers on channel are at v2.0.0 or later.
        V2_0: true

    # Application capabilities apply only to the peer network, and may be safely
    # used with prior release orderers.
    # Set the value of the capability to true to require it.
    Application: &ApplicationCapabilities
        # V2_0 application capability ensures that peers behave according
        # to v2.0 application capabilities. Peers from
        # prior releases would behave in an incompatible way, and are therefore
        # not able to participate in channels at v2.0 application capability.
        # Prior to enabling V2.0 application capabilities, ensure that all
        # peers on channel are at v2.0.0 or later.
        V2_0: true

################################################################################
#
#   SECTION: Application
#
#   This section defines the values to encode into a config transaction or
#   genesis block for application related parameters
#
################################################################################
Application: &ApplicationDefaults

   # Organizations is the list of orgs which are defined as participants on
   # the application side of the network
   Organizations:

   # Policies defines the set of policies at this level of the config tree
   # For Application policies, their canonical path is
   #   /Channel/Application/<PolicyName>
   Policies:
      Readers:
         Type: ImplicitMeta
         Rule: "ANY Readers"
      Writers:
         Type: ImplicitMeta
         Rule: "ANY Writers"
      Admins:
         Type: ImplicitMeta
         Rule: "ANY Admins"
      LifecycleEndorsement:
         Type: ImplicitMeta
         Rule: "ANY Endorsement"
      Endorsement:
         Type: ImplicitMeta
         Rule: "ANY Endorsement"

   Capabilities:
        <<: *ApplicationCapabilities


################################################################################
#
#   CHANNEL
#
#   This section defines the values to encode into a config transaction or
#   genesis block for channel related parameters.
#
################################################################################
Channel: &ChannelDefaults
    # Policies defines the set of policies at this level of the config tree
    # For Channel policies, their canonical path is
    #   /Channel/<PolicyName>
   Policies:
   # Who may invoke the 'Deliver' API
      Readers:
         Type: ImplicitMeta
         Rule: "ANY Readers"
      # Who may invoke the 'Broadcast' API
      Writers:
         Type: ImplicitMeta
         Rule: "ANY Writers"
      # By default, who may modify elements at this config level
      Admins:
         Type: ImplicitMeta
         Rule: "ANY Admins"

   # Capabilities describes the channel level capabilities, see the
   # dedicated Capabilities section elsewhere in this file for a full
   # description
   Capabilities:
      <<: *ChannelCapabilities

################################################################################
#
#   Profile
#
#   - Different configuration profiles may be encoded here to be specified
#   as parameters to the configtxgen tool
#
################################################################################
Profiles:

   OrgsOrdererGenesis:
      <<: *ChannelDefaults
      Orderer:
         # Orderer Type: The orderer implementation to start
         # Available types are "solo" and "kafka"
         OrdererType: solo
         Addresses:
            - orderer1-org0:$ORDERER1_ORG0_PORT

         # Batch Timeout: The amount of time to wait before creating a batch
         BatchTimeout: 2s

         # Batch Size: Controls the number of messages batched into a block
         BatchSize:

            # Max Message Count: The maximum number of messages to permit in a batch
            MaxMessageCount: 10

            # Absolute Max Bytes: The absolute maximum number of bytes allowed for
            # the serialized messages in a batch.
            AbsoluteMaxBytes: 99 MB

            # Preferred Max Bytes: The preferred maximum number of bytes allowed for
            # the serialized messages in a batch. A message larger than the preferred
            # max bytes will result in a batch larger than preferred max bytes.
            PreferredMaxBytes: 512 KB

         # Kafka:
         #   # Brokers: A list of Kafka brokers to which the orderer connects
         #   # NOTE: Use IP:port notation
         #   Brokers:
         #     - 127.0.0.1:9092

         # Organizations is the list of orgs which are defined as participants on
         # the orderer side of the network
         Organizations:
         - *org0

         Capabilities:
            <<: *OrdererCapabilities

         # Policies defines the set of policies at this level of the config tree
         # For Orderer policies, their canonical path is
         #   /Channel/Orderer/<PolicyName>
         Policies:
            Readers:
                  Type: ImplicitMeta
                  Rule: "ANY Readers"
            Writers:
                  Type: ImplicitMeta
                  Rule: "ANY Writers"
            Admins:
                  Type: ImplicitMeta
                  Rule: "ANY Admins"
            # BlockValidation specifies what signatures must be included in the block
            # from the orderer for the peer to validate it.
            BlockValidation:
                  Type: ImplicitMeta
                  Rule: "ANY Writers"

      Consortiums:

         SampleConsortium:

            Organizations:
               - *org1
               - *org2

   OrgsChannel:
      <<: *ChannelDefaults
      Consortium: SampleConsortium
      Application:
         <<: *ApplicationDefaults
         Organizations:
            - *org1
            - *org2
         Capabilities:
            <<: *ApplicationCapabilities
EOT