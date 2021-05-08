import {
  GETTER_USER_INFORMATION,
  GETTER_VISIBLE_ROUTES,
  GETTER_USER_TOKEN,
  GETTER_IS_VERIFIED
} from "./constants";

/**
 * Get all visible routes for a user or a guest which can be shown in the navbar/sidebar
 * @param {Array[Route]} routes Array of routes
 * @param {Route} parentRoute if given, the path will be extended by the parent path
 * @param {boolean} guest if guest, the route.hidden is replaced by route.showGuestOnly
 */
function filterVisibleRoutes(routes, parentRoute = undefined) {
  let result = [];
  routes.forEach(route => {
    const tmp = { ...route };
    if (!tmp.hidden) {
      if (tmp.children) {
        tmp.children = filterVisibleRoutes(tmp.children, tmp);
      }
      if (parentRoute && parentRoute.path != "/") {
        tmp.path = parentRoute.path + "/" + tmp.path.replace("/", "");
      }
      result.push(tmp);
    } else {
      if (tmp.children) {
        const newRoutes = filterVisibleRoutes(tmp.children, tmp);
        result = [...result, ...newRoutes];
      }
    }
  });
  return result;
}

export default {
  [GETTER_USER_INFORMATION](state) {
    return state.user;
  },
  [GETTER_VISIBLE_ROUTES](state) {
    return filterVisibleRoutes(state.accessableRoutes);
  },
  [GETTER_USER_TOKEN](state) {
    return state.user.access_token;
  },
  [GETTER_IS_VERIFIED](state) {
    return state.isVerified
  }
};
