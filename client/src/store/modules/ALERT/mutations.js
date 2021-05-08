import { MUTATION_ADD_ALERT, MUTATION_DELETE_ALERT } from "./constants";

export default {
  /* alert = { type: "success", msg: "MESSAGE", _id: "timestamp"}
   */
  [MUTATION_ADD_ALERT](state, alert) {
    alert["_id"] = Date.now();
    state.alerts.push(alert);
  },
  [MUTATION_DELETE_ALERT](state, index) {
    state.alerts.splice(index, 1);
  }
};
