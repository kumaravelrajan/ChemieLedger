# Rohstoffbörse - Client

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).


## Configure application environment (.env files)


| Key | Options | Description | Example |
| ------ | ------ | ------ | ------ |
| VUE_APP_TITLE | free text | Title of the application | Rohstoffboerse |
| VUE_APP_BACKEND_URL | URL | Url to the vue application backend. | http://localhost:3000 |
| VUE_APP_BASE_API | URL | Url to the backend API of the application. | http://localhost:3000/api/v1 |


## Please edit the following files before production

* ./src/views/general/About.vue
* ./src/views/general/Contact.vue
* ./src/views/general/Imprint.vue
* ./src/views/general/Privacy.vue

## Generate an admin user

1. Start the server application
1. Start the client application
1. Register as a normal user
1. Change the permission of the registered user through the MongoDB to 'admin'