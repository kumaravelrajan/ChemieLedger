<template>
  <CommunicationList :loading="loading" :items="items" />
</template>
<script>
import CommunicationList from "./CommunicationList";
import { getRequestCommunicationsOfOwnRequests } from "../_api";
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
    getRequestCommunicationsOfOwnRequests()
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