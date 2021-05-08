<template>
  <v-card class="elevation-1 pa-4 ma-4">
    <v-card-title>
      Handelbare Produkte
      <template v-if="!isLoggedIn">
        <v-spacer></v-spacer>
        <v-btn color="primary" class="mr-3 ml-6" to="/login">Anmelden</v-btn>um
        mit den Produkten zu handeln
      </template>
    </v-card-title>
    <v-card-text>
      <v-row class="mt-0 mb-8">
        <v-col>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Suche"
            single-line
            hide-details
          ></v-text-field>
        </v-col>
        <v-col align="right" v-if="isLoggedIn">
          <v-btn color="primary" @click="openAddProductDialog()"
            >Produkt hinzufügen...</v-btn
          >
        </v-col>
      </v-row>
      <v-data-table
        :search="search"
        :headers="headers"
        :items="products"
        class="elevation-1"
        :loading="loading"
        :loading-text="loadingText"
        no-data-text="Es können keine Produkte gehandelt werden."
        :disable-pagination="true"
        :hide-default-footer="true"
        no-results-text="Keine Produkte für Ihren Filter vorhanden..."
      >
        <template v-slot:top>
          <v-dialog v-model="addProductDialog" max-width="600px">
            <v-form
              @submit.prevent="addProduct"
              v-model="addProductValid"
              ref="productForm"
            >
              <v-card>
                <v-card-title>
                  <span class="headline">Produkt hinzufügen</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col>
                        <v-select
                          v-model="addProductData.productTitle"
                          :items="availableProductTitles"
                          item-text="description"
                          item-value="description"
                          label="Vorhandene Kategorie..."
                        ></v-select>
                      </v-col>
                      <v-col>
                        <v-text-field
                          v-model="addProductData.productTitle"
                          label="Produktname"
                          :rules="validationRules.fieldRequired"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-select
                          v-model="chooseProductUnit"
                          :items="availableUnits"
                          item-text="description"
                          item-value="value"
                          label="Vorhandene Einheit..."
                          v-on:change="unitSelected"
                          return-object
                        ></v-select>
                      </v-col>
                      <v-col>
                        <v-text-field
                          v-model="addProductData.productUnit"
                          label="Produkteinheit"
                          :rules="validationRules.fieldRequired"
                          required
                        ></v-text-field>
                        <v-text-field
                          v-model="addProductData.productUnitSymbol"
                          label="Einheitskürzel"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close"
                    >Schliessen</v-btn
                  >
                  <v-btn color="blue darken-1" text type="submit"
                    >Speichern</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
        </template>
        <template v-if="isLoggedIn" v-slot:item.action="{ item }">
          <v-icon class="mr-2" @click="linkTo(item._id)">remove_red_eye</v-icon>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>
<script>
import { mapGetters } from "vuex";
import { getProductInformation, postProduct } from "./_api";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";
import {
  STORE_KEY as AUTH_STORE_KEY,
  GETTER_USER_TOKEN as AUTH_GETTER_USER_TOKEN
} from "@/store/modules/AUTHENTICATION/constants";
import { fieldRequired } from "@/util/form-validation";
export default {
  name: "ProductList",
  data() {
    return {
      search: "",
      loading: true,
      loadingText: "Produkte werden geladen...",
      headers: [
        {
          text: "Produktbezeichnung",
          align: "left",
          value: "title.description"
        },
        { text: "Einheit", value: "unit.description" },
        { text: "", value: "action", sortable: false }
      ],
      products: [],
      availableUnits: [],
      availableProductTitles: [],

      addProductDialog: false,
      addProductValid: false,
      initAddProductData: {
        productTitle: "",
        productUnit: "",
        productUnitSymbol: ""
      },
      addProductData: {
        productTitle: "",
        productUnit: "",
        productUnitSymbol: ""
      },
      validationRules: {
        fieldRequired: fieldRequired
      },
      chooseProductUnit: null
    };
  },
  mounted() {
    this.init();
  },
  computed: {
    ...mapGetters({
      authKey: AUTH_STORE_KEY + "/" + AUTH_GETTER_USER_TOKEN
    }),
    isLoggedIn() {
      return this.authKey !== null;
    }
  },
  methods: {
    init() {
      this.loading = true;
      getProductInformation()
        .then(res => {
          if (res.data.products) {
            this.products = res.data.products;
          }
          if (res.data.units) {
            this.availableUnits = res.data.units;
          }
          if (res.data.productTitles) {
            this.availableProductTitles = res.data.productTitles;
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
    linkTo(productId) {
      this.$router.push({ path: "/product/" + productId });
    },
    unitSelected() {
      this.addProductData = Object.assign({}, this.addProductData, {
        productUnit: this.chooseProductUnit.description,
        productUnitSymbol: this.chooseProductUnit.symbol
      });
    },
    close() {
      this.addProductData = Object.assign({}, this.initAddProductData);
      this.addProductDialog = false;
      this.chooseProductUnit = null;
    },
    openAddProductDialog() {
      this.addProductData = Object.assign({}, this.initAddProductData);
      this.addProductDialog = true;
      this.chooseProductUnit = null;
    },
    addProduct() {
      if (this.$refs.productForm.validate()) {
        postProduct({
          productTitle: this.addProductData.productTitle,
          productUnit: this.addProductData.productUnit,
          productUnitSymbol: this.addProductData.productUnitSymbol
        })
          .then(res => {
            if (res.data.product) {
              // this.init();
              this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                type: "success",
                msg: "Das Produkt wurde erfolgreich der Administration vorgelegt"
                     + " und muss nun noch von dieser bestätigt werden."
              });
            } else {
              this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                type: "error",
                msg: "Das Produkt existiert bereits."
              });
            }
          })
          .catch(() => {
            this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
              type: "error",
              msg:
                "Es ist ein Fehler beim hinzufügen des Produktes aufgetreten."
            });
          })
          .finally(() => {
            this.close();
          });
      }
    }
  }
};
</script>
