import Vue from "vue";

import App from "./App.vue";
import store from "./store";
import router from "./router";
import vuetify from "./design";

import "./router/permissionRouting";
import "./util/filters";

Vue.config.productionTip = true;

new Vue({
  store,
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
