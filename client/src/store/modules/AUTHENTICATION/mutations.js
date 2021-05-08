import Vue from "vue";
import {
  MUTATION_SET_ACCESSABLE_ROUTES,
  MUTATION_SET_GUEST_USER,
  MUTATUION_SET_BASE_USER_INFORMATION,
  MUTATION_SET_ACCESS_TOKEN,
  MUTATION_SET_IS_VERIFIED,
  GUEST_USER
} from "./constants";

export default {
  [MUTATION_SET_ACCESSABLE_ROUTES](state, routes) {
    state.accessableRoutes = JSON.parse(JSON.stringify(routes));
  },
  [MUTATION_SET_GUEST_USER](state) {
    Vue.set(state, "user", GUEST_USER);
  },
  [MUTATUION_SET_BASE_USER_INFORMATION](state, baseInformation) {
    const {
      _id,
      nickname,
      name,
      surname,
      email,
      roles,
      origin,
      isVerified
    } = baseInformation;
    const baseUser = {
      _id,
      nickname,
      name,
      surname,
      email,
      roles,
      origin,
      isVerified
    };
    const combineUser = Object.assign({}, state.user, baseUser);
    Vue.set(state, "user", combineUser);
  },
  [MUTATION_SET_ACCESS_TOKEN](state, accessToken) {
    Vue.set(state.user, "access_token", accessToken);
  },
  [MUTATION_SET_IS_VERIFIED](state, isVerified){
    Vue.set(state, "isVerified", isVerified);
  }
};
