import { MUTATION_SET_DRAWER, MUTATION_TOGGLE_DRAWER, State } from "./constants";

export default {
  [MUTATION_SET_DRAWER](state: State, drawer: boolean) {
    state.drawer = drawer;
  },
  [MUTATION_TOGGLE_DRAWER](state: State) {
    state.drawer = !state.drawer;
  }
};
