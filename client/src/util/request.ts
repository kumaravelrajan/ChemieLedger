import axios from 'axios';
import store from '../store';
import {
  STORE_KEY as AUTH_STORE_KEY,
  GETTER_USER_TOKEN as AUTH_USER_TOKEN,
  ACTION_LOGOUT as AUTH_LOGOUT
} from '../store/modules/AUTHENTICATION/constants';
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from '../store/modules/ALERT/constants';

// Base service object with basic options
const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000
});

// Interceptor to set the auth-token before request is sended
request.interceptors.request.use(
  config => {
    if (store.getters[AUTH_STORE_KEY + '/' + AUTH_USER_TOKEN]) {
      config.headers['Authorization'] =
        'Bearer ' + store.getters[AUTH_STORE_KEY + '/' + AUTH_USER_TOKEN];
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor to handle, if the token is expired or not valid
request.interceptors.response.use(undefined, error => {
  return new Promise(() => {
    if (
      error.reponse &&
      error.response.status === 401 &&
      error.response.config &&
      !error.response.config.__isRetryRequest &&
      error.response.statusText !== 'Unauthorized'
    ) {
      store.dispatch(AUTH_STORE_KEY + '/' + AUTH_LOGOUT);
      store.commit(
        ALERT_STORE_KEY + '/' + ADD_ALERT,
        {
          type: 'warning',
          msg:
            'Sie wurden aufgrund von Inaktivität abgemeldet. Bitte melden Sie sich neu an.'
        },
        { root: true }
      );
    }
    if (
      error.reponse &&
      error.response.config &&
      !error.response.config.__isRetryRequest &&
      error.response.data &&
      error.response.data.errors
    ) {
      const { errors } = error.response.data;
      errors.forEach((error: any) => {
        store.commit(
          ALERT_STORE_KEY + '/' + ADD_ALERT,
          {
            type: 'error',
            msg: error.msg
          },
          { root: true }
        );
      });
    } else if (error.request) {
      console.warn('Server not reachable! ')
      throw error
    } else {
      console.warn('An error occurred when trying to reach the server! ', error)
      throw error;
    }
    
  });
});

export default request;
