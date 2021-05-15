/**
 * You need to have a permission store element to use this code
 */

import router from "../router";
import store from "../store";
import getPageTitle from "../util/get-page-title";
import {
  STORE_KEY as AUTH_STORE_KEY,
  GETTER_VISIBLE_ROUTES as AUTH_GET_VISIBLE_ROUTES,
  GETTER_USER_INFORMATION as AUTH_GET_USERINFORMATION,
  ACTION_CREATE_ACCESSABLE_ROUTES as AUTH_CREATE_ACCESSABLE_ROUTES,
  GETTER_IS_VERIFIED as AUTH_GET_IS_VERIFIED
} from "../store/modules/AUTHENTICATION/constants";
import {
  STORE_KEY as ALERT_STORE_KEY,
  GETTER_ALERT as ALERT_GET_ALERT,
  MUTATION_DELETE_ALERT as ALERT_DELETE_ALERT
} from "../store/modules/ALERT/constants";

router.beforeEach((to, from, next) => {
  /**
   * Delete old alerts when page changes
   */
  const alerts = store.getters[ALERT_STORE_KEY + "/" + ALERT_GET_ALERT];
  for (var al in alerts) {
    store.commit(ALERT_STORE_KEY + "/" + ALERT_DELETE_ALERT, al);
  }

  /**
   * Check the access to the requested route
   */
  if (to.meta && to.meta.roles) {
    const { roles } = store.getters[
      AUTH_STORE_KEY + "/" + AUTH_GET_USERINFORMATION
    ];
    if (!roles || !to.meta.roles.some((role: string) => roles.includes(role))) {
      if (from.name === null) {
        return next("/");
      } else {
        return next(false);
      }
    }
  }
  /**
   * if user is allowed to enter the requested route, check if the further accessable routes are loaded to show them in the sidebar
   */
  const areRoutesLoaded =
    store.getters[AUTH_STORE_KEY + "/" + AUTH_GET_VISIBLE_ROUTES].length > 0;
  if (!areRoutesLoaded) {
    store.dispatch(AUTH_STORE_KEY + "/" + AUTH_CREATE_ACCESSABLE_ROUTES);
  }

  document.title = getPageTitle(to.meta.title);
  
  if(!store.getters[AUTH_STORE_KEY + "/" + AUTH_GET_IS_VERIFIED] && (to.path !== "/unverified") && (to.path !== "/logout")) {
    return next({ path: "/unverified" })
  }
  
  return next();
});
