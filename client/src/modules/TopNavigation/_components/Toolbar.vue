<template>
  <v-app-bar fixed app>
    <v-app-bar-nav-icon @click="toggleNavDrawer"></v-app-bar-nav-icon>
    <v-toolbar-title v-if="title">{{ title }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <router-link to="/">
      <v-toolbar-items>
        <v-img width="250px" :src="img"></v-img>
      </v-toolbar-items>
    </router-link>
  </v-app-bar>
</template>

<script>
import { mapMutations } from "vuex";
import { STORE_KEY, MUTATION_TOGGLE_DRAWER } from "../_store/constants";

export default {
  name: "Toolbar",
  props: {
    title: String
  },
  data: () => ({
    img: require("@/assets/images/logo.png")
  }),
  methods: {
    ...mapMutations({
      toggleNavDrawer: STORE_KEY + "/" + MUTATION_TOGGLE_DRAWER
    })
  }
};
</script>
