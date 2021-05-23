export const STORE_KEY = "ALERT";

export const MUTATION_ADD_ALERT = "ADD_ALERT";
export const MUTATION_DELETE_ALERT = "DELETE_ALERT";

export const GETTER_ALERT = "GET_ALERT";

export interface Alert {
    type: string,
    msg: string,
    _id: number
}

export interface State {
    alerts: Alert[]
}
