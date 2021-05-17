import { Alert, MUTATION_ADD_ALERT, MUTATION_DELETE_ALERT, State } from "./constants";

export default {
  /* alert = { type: "success", msg: "MESSAGE", _id: "timestamp"}
   */
  [MUTATION_ADD_ALERT](state: State, alert: Alert) {
    alert["_id"] = Date.now();
    state.alerts.push(alert);
  },
  [MUTATION_DELETE_ALERT](state: State, index: number) {
    state.alerts.splice(index, 1);
  }
};
