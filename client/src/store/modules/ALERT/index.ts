import actions from "./actions";
import { State } from "./constants";
import getters from "./getters";
import mutations from "./mutations";

const state: State = {
  alerts: []
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
};
