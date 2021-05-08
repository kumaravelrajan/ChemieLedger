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
  ACTION_VERIFY_EMAIL
} from "./constants";
import { definedRoutes } from "@/router";
import { registerUser, loginUser, changeProfile, verifyEmail } from "@/api/auth";

/**
 * Checks, if roles matches one of the properties in route.meta.roles
 * @param {Array} roles
 * @param {Route} route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    if (roles == undefined) {
      return false;
    } else {
      return route.meta.roles.some(role => roles.includes(role));
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
function filterRoutesByUserRole(routes, roles) {
  const result = [];
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

export default {
  [ACTION_CREATE_ACCESSABLE_ROUTES]({ commit, state }) {
    const accessableRoutes = filterRoutesByUserRole(
      definedRoutes,
      state.user.roles
    );
    commit(MUTATION_SET_ACCESSABLE_ROUTES, accessableRoutes);
  },
  [ACTION_INITIALIZE_USER]({ commit, dispatch }, user) {
    sessionStorage.setItem(LOCAL_STORE_USER, JSON.stringify(user));
    commit(MUTATION_SET_IS_VERIFIED, user.isVerified)
    commit(MUTATUION_SET_BASE_USER_INFORMATION, {
      _id: user._id,
      nickname: user.nickname,
      name: user.name,
      surname: user.surname,
      email: user.email,
      roles: user.roles,
      origin: user.origin,
      isVerified: user.isVerified
    });
    commit(MUTATION_SET_ACCESS_TOKEN, user.access_token);
    dispatch(ACTION_CREATE_ACCESSABLE_ROUTES);
  },
  [ACTION_LOGOUT]({ commit, dispatch }) {
    sessionStorage.removeItem(LOCAL_STORE_USER);
    commit(MUTATION_SET_GUEST_USER);
    commit(MUTATION_SET_IS_VERIFIED, true)
    dispatch(ACTION_CREATE_ACCESSABLE_ROUTES);
  },
  [ACTION_LOGIN]({ dispatch }, userData) {
    const { email, password } = userData;
    return new Promise((resolve, reject) => {
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
          dispatch(ACTION_INITIALIZE_USER, user);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  [ACTION_REGISTER]({ dispatch }, registerData) {
    const { nickname, name, surname, email, password } = registerData;
    return new Promise((resolve, reject) => {
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
          dispatch(ACTION_INITIALIZE_USER, user);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  [ACTION_CHANGE_PROFILE]({ commit }, data) {
    const { nickname, name, surname, origin } = data;
    return new Promise((resolve, reject) => {
      changeProfile({ nickname, name, surname, origin })
        .then(res => {
          const storedUser = JSON.parse(
            sessionStorage.getItem(LOCAL_STORE_USER)
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
          commit(MUTATUION_SET_BASE_USER_INFORMATION, user);
          sessionStorage.setItem(LOCAL_STORE_USER, JSON.stringify(user));
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  [ACTION_VERIFY_EMAIL]({ dispatch }, token) {
    return new Promise((resolve, reject) => {
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
          dispatch(ACTION_INITIALIZE_USER, user);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
