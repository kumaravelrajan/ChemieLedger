import { GETTER_ALERT, State } from "./constants";

export default {
  [GETTER_ALERT](state: State) {
    return state.alerts;
  }
};
