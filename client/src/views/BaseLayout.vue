<template>
  <v-app>
    <TopNavigation />
    <AlertList style="position:fixed; z-index:5"/>
    <v-content container--fluid>
      <router-view :key="key" />
    </v-content>
    <Footer />
  </v-app>
</template>

<script>
import { TopNavigation, Footer, AlertList } from "@/modules";

export default {
  name: "BaseLayout",
  components: {
    TopNavigation,
    Footer,
    AlertList
  },
  computed: {
    key() {
      return this.$route.path;
    }
  }
};
</script>