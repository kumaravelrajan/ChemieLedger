<template>
  <CommunicationList :loading="loading" :items="items" />
</template>
<script>
import CommunicationList from "./CommunicationList";
import { getNewRequestCommunications } from "../_api";
export default {
  name: "OwnCommunicationOverview",
  components: {
    CommunicationList
  },
  data() {
    return {
      loading: true,
      items: []
    };
  },
  mounted() {
    this.loading = true;
    getNewRequestCommunications()
      .then(res => {
        if (res.data.communications) {
          this.items = res.data.communications;
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }
};
</script>