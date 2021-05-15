import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import { LOCAL_STORE_USER, GUEST_USER, State } from "./constants";

const user = JSON.parse(sessionStorage.getItem( LOCAL_STORE_USER) || '');

const state: State = {
  accessableRoutes: [],
  user: user ? user : GUEST_USER,
  isVerified: user ? user.isVerified : GUEST_USER.isVerified
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
};
