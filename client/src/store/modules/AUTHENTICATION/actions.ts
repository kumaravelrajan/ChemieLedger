import {
  ACTION_CREATE_ACCESSABLE_ROUTES,
  ACTION_LOGOUT,
  ACTION_REGISTER,
  ACTION_CHANGE_PROFILE,
  MUTATION_SET_ACCESSABLE_ROUTES,
  MUTATION_SET_GUEST_USER,
  MUTATUION_SET_BASE_USER_INFORMATION,
  LOCAL_STORE_USER,
  ACTION_LOGIN,
  ACTION_INITIALIZE_USER,
  MUTATION_SET_ACCESS_TOKEN,
  MUTATION_SET_IS_VERIFIED,
  ACTION_VERIFY_EMAIL,
  State,
  User
} from './constants';
import { definedRoutes } from '../../../router';
import { registerUser, loginUser, changeProfile, verifyEmail } from '../../../api/auth';
import { RouteConfig } from 'vue-router';

/**
 * Checks, if roles matches one of the properties in route.meta.roles
 * @param {Array} roles
 * @param {Route} route
 */
function hasPermission(roles: string[], route: RouteConfig) {
  if (route.meta && route.meta.roles) {
    if (roles == undefined) {
      return false;
    } else {
      return route.meta.roles.some((role: string) => roles.includes(role));
    }
  } else {
    return true;
  }
}

/**
 * Filter all routes by the roles
 * @param {Array[Route]} routes
 * @param {Array} roles
 */
function filterRoutesByUserRole(routes: RouteConfig[], roles: string[]): RouteConfig[] {
  const result: RouteConfig[] = [];
  routes.forEach(route => {
    const tmp = { ...route };
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterRoutesByUserRole(tmp.children, roles);
      }
      result.push(tmp);
    }
  });
  return result;
}

export type Mutations<S = State> = {
  [''](state: S, payload: number): void
}

export default {
  [ACTION_CREATE_ACCESSABLE_ROUTES](x: { commit: any, state: State }) {
    const accessableRoutes = filterRoutesByUserRole(
      definedRoutes,
      x.state.user.roles
    );
    x.commit(MUTATION_SET_ACCESSABLE_ROUTES, accessableRoutes);
  },
  [ACTION_INITIALIZE_USER](x: { commit: any, dispatch: any }, user: User) {
    sessionStorage.setItem(LOCAL_STORE_USER, JSON.stringify(user));
    x.commit(MUTATION_SET_IS_VERIFIED, user.isVerified)
    x.commit(MUTATUION_SET_BASE_USER_INFORMATION, {
      _id: user._id,
      nickname: user.nickname,
      name: user.name,
      surname: user.surname,
      email: user.email,
      roles: user.roles,
      origin: user.origin,
      isVerified: user.isVerified
    });
    x.commit(MUTATION_SET_ACCESS_TOKEN, user.access_token);
    x.dispatch(ACTION_CREATE_ACCESSABLE_ROUTES);
  },
  [ACTION_LOGOUT](x: { commit: any, dispatch: any }) {
    sessionStorage.removeItem(LOCAL_STORE_USER);
    x.commit(MUTATION_SET_GUEST_USER);
    x.commit(MUTATION_SET_IS_VERIFIED, true)
    x.dispatch(ACTION_CREATE_ACCESSABLE_ROUTES);
  },
  [ACTION_LOGIN](x: { dispatch: any }, userData: any) {
    const { email, password } = userData;
    return new Promise<void>((resolve, reject) => {
      loginUser({ email, password })
        .then(res => {
          const { data } = res;
          const user = {
            _id: data._id,
            nickname: data.nickname,
            name: data.name,
            surname: data.surname,
            email: data.email,
            roles: data.roles,
            access_token: data.access_token,
            origin: data.origin,
            isVerified: data.isVerified
          };
          x.dispatch(ACTION_INITIALIZE_USER, user);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  [ACTION_REGISTER](x: { dispatch: any }, registerData: any) {
    const { nickname, name, surname, email, password } = registerData;
    return new Promise<void>((resolve, reject) => {
      registerUser({ nickname, name, surname, email, password })
        .then(res => {
          const { data } = res;
          const user = {
            _id: data._id,
            nickname: data.nickname,
            name: data.name,
            surname: data.surname,
            email: data.email,
            roles: data.roles,
            access_token: data.access_token,
            origin: data.origin,
            isVerified: data.isVerified
          };
          x.dispatch(ACTION_INITIALIZE_USER, user);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  [ACTION_CHANGE_PROFILE](x: { commit: any }, data: any) {
    const { nickname, name, surname, origin } = data;
    return new Promise<void>((resolve, reject) => {
      changeProfile({ nickname, name, surname, origin })
        .then(res => {
          const storedUser = JSON.parse(
            sessionStorage.getItem(LOCAL_STORE_USER) || '{}'
          );
          const { data } = res;
          const user = {
            _id: data._id,
            nickname: data.nickname,
            name: data.name,
            surname: data.surname,
            email: data.email,
            roles: data.roles,
            access_token: storedUser.access_token,
            origin: data.origin,
            isVerified: data.isVerified
          };
          x.commit(MUTATUION_SET_BASE_USER_INFORMATION, user);
          sessionStorage.setItem(LOCAL_STORE_USER, JSON.stringify(user));
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  [ACTION_VERIFY_EMAIL](x: { dispatch: any }, token: string) {
    return new Promise<void>((resolve, reject) => {
      verifyEmail(token)
        .then(res => {
          const { data } = res;
          const user = {
            _id: data._id,
            nickname: data.nickname,
            name: data.name,
            surname: data.surname,
            email: data.email,
            roles: data.roles,
            access_token: data.access_token,
            origin: data.origin,
            isVerified: data.isVerified
          };
          localStorage.setItem('isVerified', data.isVerified);
          x.dispatch(ACTION_INITIALIZE_USER, user);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
