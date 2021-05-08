<template>
  <v-container>
    <v-card v-if="loaded">
      <v-card-title>{{product.title.description}} / {{product.unit.description}}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col class="pa-0" justify="center" align="center">
            <Chart :productId="product._id" />
          </v-col>
        </v-row>
        <v-row>
          <v-col class="pa-0" justify="center" align="center">
            <v-btn color="primary" :to="'/explorer/addrequest/'+product._id">Gesuch hinzufügen</v-btn>
            <RequestProductList :isOffer="false" :productId="product._id" />
          </v-col>
          <v-col class="pa-0" justify="center" align="center">
            <v-btn color="primary" :to="'/explorer/addoffer/'+product._id">Angebot hinzufügen</v-btn>
            <RequestProductList :isOffer="true" :productId="product._id" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import { getProduct } from "./_api";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";
import RequestProductList from "../Explorer/RequestProductList";
import Chart from "./_components/Chart"

export default {
  name: "Product",
  components: {
    RequestProductList,
    Chart
  },
  props: {
    productId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loaded: false,
      product: null
    };
  },
  mounted() {
    getProduct(this.productId)
      .then(res => {
        if (res.data.product) {
          this.product = res.data.product;
          this.loaded = true;
        } else {
          this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
            type: "error",
            msg: "Dieses Produkt existiert leider nicht..."
          });
        }
      })
      .catch(() => {
        //SHOULD NOT HAPPEN
      });
  }
};
</script>