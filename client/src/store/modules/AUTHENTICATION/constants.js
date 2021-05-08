export const STORE_KEY = "AUTHENTICATION";

export const LOCAL_STORE_USER = "_user";

export const GUEST_USER = {
  _id: null,
  nickname: null,
  name: null,
  surname: null,
  email: null,
  roles: ["guest"],
  access_token: null,
  origin: null,
  isVerified: true
};

export const MUTATION_SET_ACCESSABLE_ROUTES = "SET_ACCESSABLE_ROUTES";
export const MUTATION_SET_GUEST_USER = "SET_GUEST_USER";
export const MUTATUION_SET_BASE_USER_INFORMATION = "SET_BASE_USER_INFORMATION";
export const MUTATION_SET_ACCESS_TOKEN = "SET_ACCESS_TOKEN";
export const MUTATION_SET_IS_VERIFIED = "SET_IS_VERIFIED";

export const GETTER_USER_INFORMATION = "GET_USERINFO";
export const GETTER_VISIBLE_ROUTES = "GET_VISIBLE_ROUTES";
export const GETTER_USER_TOKEN = "GET_USER_TOKEN";
export const GETTER_IS_VERIFIED = "GET_IS_VERIFIED";

export const ACTION_CREATE_ACCESSABLE_ROUTES = "CREATE_ACCESSABLE_ROUTES";
export const ACTION_LOGOUT = "LOGOUT";
export const ACTION_REGISTER = "REGISTER";
export const ACTION_LOGIN = "LOGIN";
export const ACTION_INITIALIZE_USER = "INIT_USER";
export const ACTION_CHANGE_PROFILE = "CHANGE_USER_PROFILE";
export const ACTION_VERIFY_EMAIL = "VERIFY_EMAIL"
