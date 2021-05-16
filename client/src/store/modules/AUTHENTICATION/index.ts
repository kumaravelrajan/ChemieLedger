import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import { LOCAL_STORE_USER, GUEST_USER, State, User } from "./constants";

const userSession = sessionStorage.getItem( LOCAL_STORE_USER)
const user: User = userSession ? JSON.parse(userSession) : null

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
