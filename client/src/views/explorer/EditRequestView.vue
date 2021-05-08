<template>
  <EditRequest :requestId="requestId" />
</template>
<script>
import { EditRequest } from "@/modules";

export default {
  name: "RequestView",
  props: ["requestId"],
  components: {
    EditRequest
  }
};
</script>