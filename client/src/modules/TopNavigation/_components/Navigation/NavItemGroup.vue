<template>
  <v-list-group :prepend-icon="getPrependIcon()" no-action :sub-group="subGroup" :value="true">
    <template v-slot:activator>
      <v-list-item-content>
        <v-list-item-title>{{rootRoute.meta.title}}</v-list-item-title>
      </v-list-item-content>
    </template>
    <template v-for="route in rootRoute.children">
      <NavItemGroup
        v-if="route.children && route.children.length>0"
        :key="route.path"
        :rootRoute="route"
        :subGroup="true"
      />
      <NavItem v-if="!route.children || route.children.length<=0" :key="route.path" :item="route" />
    </template>
  </v-list-group>
</template>
<script>
import NavItem from "./NavItem";

export default {
  name: "NavItemGroup",
  components: {
    NavItem
  },
  props: {
    rootRoute: {
      type: Object,
      required: true
    },
    subGroup: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    getPrependIcon() {
      if (this.rootRoute.meta && this.rootRoute.meta.icon) {
        return this.rootRoute.meta.icon;
      } else {
        return "";
      }
    }
  }
};
</script>
