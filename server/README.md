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