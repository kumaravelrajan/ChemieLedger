import { GETTER_DRAWER, State } from "./constants";

export default {
  [GETTER_DRAWER](state: State) {
    return state.drawer;
  }
};
