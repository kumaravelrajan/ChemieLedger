<template>
  <div>
    <Navigation />
    <Toolbar />
  </div>
</template>

<script>
import { STORE_KEY } from "./_store/constants";
import store from "./_store";
import Toolbar from "./_components/Toolbar";
import Navigation from "./_components/Navigation";

export default {
  name: "TopNavigation",
  components: {
    Toolbar,
    Navigation
  },
  created() {
    if (!(STORE_KEY in this.$store._modules.root._children)) {
      this.$store.registerModule(STORE_KEY, store);
    }
  }
};
</script>