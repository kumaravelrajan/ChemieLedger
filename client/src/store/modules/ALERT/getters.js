import { GETTER_ALERT } from "./constants";

export default {
  [GETTER_ALERT](state) {
    return state.alerts;
  }
};
