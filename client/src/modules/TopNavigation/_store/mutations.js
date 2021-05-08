import { MUTATION_SET_DRAWER, MUTATION_TOGGLE_DRAWER } from "./constants";

export default {
  [MUTATION_SET_DRAWER](state, drawer) {
    state.drawer = drawer;
  },
  [MUTATION_TOGGLE_DRAWER](state) {
    state.drawer = !state.drawer;
  }
};
