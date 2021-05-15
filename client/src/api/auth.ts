import { User } from '../store/modules/AUTHENTICATION/constants';
import request from '../util/request';

export function registerUser(data: any) {
  return request({ url: '/auth/register', method: 'post', data });
}

export function loginUser(data: {email: string, password: string}) {
  return request({ url: '/auth/login', method: 'post', data });
}

export function changeProfile(data: any) {
  return request({ url: '/auth/profile', method: 'patch', data });
};

export function resetPasswordRequest(data: {email: string}) {
  return request({ url: '/auth/resetRequest', method: 'post', data });
};

export function sendNewVerificationEmail() {
  return request({ url: '/auth/sendNewVerificationEmail', method: 'get'});
};

export function resetPassword(data: {password: string}, token: string) {
  return request({ url: '/auth/resetPassword', method: 'post', data,
    headers: {
      Authorization: 'Bearer ' + token
    }
  });
};

export function verifyEmail(token: string){
  return request({ url: '/auth/verifyEmail', method: 'get',
    headers: {
      Authorization: 'Bearer ' + token
    }
  });
};
