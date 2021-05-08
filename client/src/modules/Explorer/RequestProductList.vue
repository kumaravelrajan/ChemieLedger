<template>
  <v-card class="elevation-1 pa-4 ma-4">
    <v-card-title>{{isOffer?"Angebote":"Gesuche"}}</v-card-title>
    <v-card-text>
      <RequestList :items="items" :loading="loading" :showPictures="isOffer" />
    </v-card-text>
  </v-card>
</template>
<script>
import RequestList from "./_components/RequestList";
import { getProductOffers, getProductRequests } from "./_api";

export default {
  name: "RequestProductList",
  components: {
    RequestList
  },
  props: {
    isOffer: {
      type: Boolean,
      required: true
    },
    productId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      items: []
    };
  },
  mounted() {
    if (this.isOffer) {
      getProductOffers(this.productId)
        .then(res => {
          if (res.data.offers) {
            this.items = res.data.offers;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    } else {
      getProductRequests(this.productId)
        .then(res => {
          if (res.data.requests) {
            this.items = res.data.requests;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>