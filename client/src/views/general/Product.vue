<template>
  <ProductList />
</template>
<script>
import { ProductList } from "@/modules";
import { mapGetters } from "vuex";
import {
  STORE_KEY as AUTH_STORE_KEY,
  GETTER_USER_TOKEN as AUTH_GETTER_USER_TOKEN
} from "@/store/modules/AUTHENTICATION/constants";
export default {
  name: "Product",
  components: {
    ProductList
  },
  created() {
    if (this.isLoggedIn()) {
      this.$router.push({ path: "/product/productoverview" });
    }
  },
  computed: {
    ...mapGetters({
      authKey: AUTH_STORE_KEY + "/" + AUTH_GETTER_USER_TOKEN
    })
  },
  methods: {
    isLoggedIn() {
      return this.authKey !== null;
    }
  }
};
</script>