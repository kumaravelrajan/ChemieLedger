<template>
  <AddRequest :productId="productId" :isOffer="false" />
</template>
<script>
import { AddRequest } from "@/modules";

export default {
  name: "GenerateRequest",
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