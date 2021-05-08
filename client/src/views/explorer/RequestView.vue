<template>
  <ViewRequest :requestId="requestId" />
</template>
<script>
import { ViewRequest } from "@/modules";

export default {
  name: "RequestView",
  props: ["requestId"],
  components: {
    ViewRequest
  }
};
</script>