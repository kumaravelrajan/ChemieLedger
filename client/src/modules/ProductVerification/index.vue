<template>
  <v-card class="elevation-1 pa-4 ma-4">
    <v-card-title>
      Produkt Freigabe
    </v-card-title>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="products"
        class="elevation-1"
        :loading="loading"
        loading-text= "Produkte werden geladen..."
        no-data-text="Keine neuen Produkte müssen bestätigt werden."
        :disable-pagination="true"
        :hide-default-footer="true"
      >
        <template v-slot:item.action="{ item }">
            <v-icon class="mr-2" @click="confirmProduct(item)">done</v-icon>
            <v-icon @click="confirmRejectProduct(item)">delete</v-icon>
        </template>

        <template v-slot:top>
          <v-dialog v-model="dialog" max-width="400px">
            <v-card>
              <v-card-title>
                <span class="headline">Produkt endgültig löschen</span>
              </v-card-title>
              <v-card-text>
                  Sind Sie sich sicher, dass Sie das Produkt löschen wollen?
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="rejectProduct()"
                  >Löschen</v-btn
                >
                <v-btn color="grey darken-1" text @click="close"
                  >Schliessen</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>

      </v-data-table>
    </v-card-text>
  </v-card>
</template>
<script>
import { getUnverifiedProducts, verifyProduct, deleteProduct } from "./_api";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";

export default {
  name: "ProductVerification",
  data() {
    return {
      loading: true,
      dialog: false,
      productToDelete: null,
      headers: [
        {
          text: "Produktbezeichnung",
          align: "left",
          value: "title.description"
        },
        { text: "Einheit", value: "unit.description" },
        { text: "", value: "action", sortable: false, align: 'center' }
      ],
      products: [],

    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init () {
      this.loading = true;
      this.loadUnverifiedProducts();
    },
    loadUnverifiedProducts () {
      getUnverifiedProducts()
        .then(res => {
          if (res.data.products) {
            this.products = res.data.products;
          }
        })
        .catch(() => {
          this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
            type: "error",
            msg: "Es ist ein Fehler beim Laden der Produkte aufgetreten."
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },
    close() {
      this.dialog = false;
      this.productToDelete = null;
    },
    confirmRejectProduct (item) {
      this.productToDelete = item;
      this.dialog = true;
    },
    confirmProduct (item) {
      verifyProduct(item._id)
        .then(res => {
            if (res.data.success) {
              this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                  type: "success",
                  msg: "Das Produkt wurde erfolgreich freigegeben."
              });
              this.loadUnverifiedProducts();
            }
        })
        .catch(() => {
          //should not happen
        });
    },
    async rejectProduct () {
      deleteProduct(this.productToDelete._id)
        .then(res => {
            if (res.data.success) {
              this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                  type: "success",
                  msg: "Das Produkt wurde erfolgreich gelöscht."
              });
              this.loadUnverifiedProducts();
            }
        })
        .catch(() => {
          //should not happen
        });
      this.dialog = false;
    }
  }
};
</script>
