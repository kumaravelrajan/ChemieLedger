# Rohstoffbörse - server

## Project setup

```
yarn
```

### Compiles and hot-reloads for development

```
yarn server
```

### Compiles and minifies for production

```
yarn build
```

### Lints files

```
yarn lint
```

### Lints and fixes files

```
yarn fixlint
```

### Run tests if specified

```
yarn test
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).


## Configure application environment (.env files)

| Key | Options | Description | Example |
| ------ | ------ | ------ | ------ |
| NODE_INV | "prod" or "dev" | Enable production or development mode. | prod |
| PORT | INT | Port value of the backend application. | 3000 |
| MONGODB_URI | MongoDB-URL | Url to the MongoDB server database. | mongodb://localhost:27017/rohstoffboerse |
| MONGODB_USER | String | User name of MongoDB database. | user |
| MONGODB_PASS | String | Password of MongoDB database. | password |
| JWT_SECRET | String | String to encrypt the Java-Token. | d3kSb24v5y87dke561Y |
| JWT_EXPIRATION_HOURS | INT | Hours when Java-Token expires (automatic logout of the user). | 12 |
| IMAGE_PATH | Relative path | Relative path to the images to the platform that are uploaded by users. | /public/pictures |
| PUBLIC_PATH | Relative path | Relative path to the public assets (e.g. home screen images) | /public |
| EMAIL_USERNAME | String | Username to the mail account that is used for mail services like password reset. | emailUser |
| EMAIL_PASSWORD | String | Password to the mail account that is used for mail services like password reset. | emailPassword |
| EMAIL_FROM_ADDRESS | email | Mail address of the mail service account | info@rohstoffboerse.de |
| EMAIL_RESET_LINK | URL | URL to the password reset page of the client application. | https://localhost:8080/reset_password |
| RESET_JWT_EXPIRATION_MINUTES | INT | Time in minutes to expire the password reset token. | 10 |
| EMAIL_VERIFIKATION_LINK | URL | URL to the mail verification page of the client application. | http://localhost:8080/email_verification |
| VERIFIKATION_JWT_EXPIRATION_MINUTES | INT | Time in minutes to expire the mail verification token. | 30 |
| EMAIL_HOST | URL | URL to the mail host. | smtp.gmail.com |


## Connect to Blockchain
To make use of the blockchain API, deploy a network following the guide in the `/Fabric-Prod-Nw` folder.

The main configuration points are:

1. `.env` file:
    Here the following variables must be configured:
```sh
# The admin user ID of the certification authority of the organization. Cf. Fabric-Prod-Nw
CA_ADMIN_USER_ID=rca-org1-admin
# The password of the CA admin user 
CA_ADMIN_PW=rca-org1-adminpw
# The MSP ID of the organization
MSP_ORG=org1MSP
# The host name of the organizations CA
CA_HOST_NAME=rca-org1
# Name of the channel
CHANNEL_NAME=mychannel
# Name of the deployed chaincode
CHAINCODE_ID=mycc
# The master key that is used to encrypt all user wallets
WALLET_MASTER_KEY=vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3
```

2. `/assets/connectionProfile.json` file:
    This file defines the necessary information to connect to the organization's peers. Most importantly, the CA certificate and the root TLS certificates must be set. Note that these certificates are newly generated whenever the start script of the blockchain network is run.

If these files were configured correctly, the server will automatically enroll the admin user on startup. This admin user can then enroll new users. Once a new user on the rohstoffboerse is verified, he will be enrolled in the network. His newly generated indentity (certificate + private key) are stored in the MongoDB database in the user schema.
After verification the user can make simple API call using the issued JWT token to query the chaincode. The respective API is defined in `/src/routes/fabric.js`.

For a detailed chaincode API description refer to `/Fabric-Prod-Nw/chaincode`
