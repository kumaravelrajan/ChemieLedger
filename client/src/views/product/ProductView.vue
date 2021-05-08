<template>
  <Product :productId="id" />
</template>
<script>
import { Product } from "@/modules";
export default {
  name: "ProductView",
  components: {
    Product
  },
  props: {
    id: {
      type: String,
      required: true
    }
  }
};
</script>