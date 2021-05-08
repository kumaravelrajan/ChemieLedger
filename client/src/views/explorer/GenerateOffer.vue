<template>
  <AddRequest :productId="productId" :isOffer="true" />
</template>
<script>
import { AddRequest } from "@/modules";

export default {
  name: "GenerateOffer",
  props: {
    productId: {
      type: String,
      default: null
    }
  },
  components: {
    AddRequest
  }
};
</script>