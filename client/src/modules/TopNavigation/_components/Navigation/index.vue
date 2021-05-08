<template>
  <v-navigation-drawer :value="drawer" @input="setDrawer" app fixed>
    <v-list dense>
      <template v-for="route in visibleRoutes">
        <template v-if="route.children && route.children.length > 0">
          <NavItemGroup :rootRoute="route" :subGroup="false" :key="route.path" />
        </template>
        <template v-else>
          <NavItem :item="route" :key="route.path" />
        </template>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import {
  STORE_KEY,
  GETTER_DRAWER,
  MUTATION_SET_DRAWER
} from "../../_store/constants";
import {
  STORE_KEY as AUTH_STORE_KEY,
  GETTER_VISIBLE_ROUTES as AUTH_GET_VISIBLE_ROUTES
} from "@/store/modules/AUTHENTICATION/constants";
import NavItem from "./NavItem";
import NavItemGroup from "./NavItemGroup";

export default {
  name: "Navigation",
  components: { NavItem, NavItemGroup },
  computed: {
    ...mapGetters({
      drawer: STORE_KEY + "/" + GETTER_DRAWER,
      visibleRoutes: AUTH_STORE_KEY + "/" + AUTH_GET_VISIBLE_ROUTES
    })
  },

  methods: {
    ...mapMutations({
      setDrawerMutation: STORE_KEY + "/" + MUTATION_SET_DRAWER
    }),
    setDrawer(boolIsOpen) {
      if (this.drawer !== boolIsOpen) {
        this.setDrawerMutation(boolIsOpen);
      }
    }
  }
};
</script>