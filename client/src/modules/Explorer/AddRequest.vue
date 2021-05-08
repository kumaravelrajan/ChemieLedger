<template>
  <v-container>
    <v-card>
      <v-card-title>
        <template v-if="isOffer">Angebot erstellen</template>
        <template v-else>Gesuch erstellen</template>
      </v-card-title>
      <v-card-text>
        <v-row v-if="loading">
          <v-col align="center" justify="center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-col>
        </v-row>
        <RequestForm v-if="requestId!=null" :requestId="requestId" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import RequestForm from "./_components/RequestForm";
import { createRequest } from "./_api";
export default {
  name: "AddRequest",
  components: {
    RequestForm
  },
  props: {
    productId: {
      type: String,
      default: null
    },
    isOffer: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: true,
      requestId: null
    };
  },
  mounted() {
    createRequest({ isOffer: this.isOffer, productId: this.productId })
      .then(res => {
        if (res.data.request) {
          this.requestId = res.data.request._id;
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }
};
</script>