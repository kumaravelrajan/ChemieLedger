import Vue from "vue";
import { State } from "../AUTHENTICATION/constants";
import {
  MUTATION_SET_ACCESSABLE_ROUTES,
  MUTATION_SET_GUEST_USER,
  MUTATUION_SET_BASE_USER_INFORMATION,
  MUTATION_SET_ACCESS_TOKEN,
  MUTATION_SET_IS_VERIFIED,
  GUEST_USER,
  User
} from "./constants";

export default {
  [MUTATION_SET_ACCESSABLE_ROUTES](state: State, routes: any) {
    state.accessableRoutes = JSON.parse(JSON.stringify(routes));
  },
  [MUTATION_SET_GUEST_USER](state: State) {
    Vue.set(state, "user", GUEST_USER);
  },
  [MUTATUION_SET_BASE_USER_INFORMATION](state: State, baseInformation: User) {
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
  [MUTATION_SET_ACCESS_TOKEN](state: State, accessToken: any) {
    Vue.set(state.user, "access_token", accessToken);
  },
  [MUTATION_SET_IS_VERIFIED](state: State, isVerified: boolean){
    Vue.set(state, "isVerified", isVerified);
  }
};
