<template>
  <v-container>
    <v-card class="elevation-1 pa-4 ma-4">
      <Map
        :items="items"
        :ready="!loading"
        style="z-index:0; margin-top:16px"
      />
      <div :class="isMobile ? '' : 'd-flex'">
        <v-card-title
          :style="{
            width: isMobile ? '100%' : '100%',
            'align-items': 'start',
          }"
        >
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header @click="changeFilterUnfolded()">
                Filter
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row>
                  <v-col>
                    <v-text-field v-model="filter.searchTerm" label="Freitext"
                      ><template v-slot:prepend>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on }">
                            <v-icon v-on="on">info</v-icon>
                          </template>
                          Alle Felder von Angeboten/Gesuchen werden durchsucht.
                        </v-tooltip>
                      </template>
                    </v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-select
                      v-model="filter.origin"
                      :items="availableOrigins"
                      item-text="description"
                      item-value="_id"
                      label="Herkunft"
                    ></v-select>
                  </v-col>
                  <v-col>
                    <v-select
                      v-model="filter.product"
                      :items="availableProducts"
                      :item-text="getItemText"
                      return-object
                      label="Produkt"
                    >
                      <template v-slot:item="data">{{
                        data.item.unit.symbol
                          ? data.item.title.description +
                            "/" +
                            data.item.unit.symbol
                          : data.item.title.description +
                            "/" +
                            data.item.unit.description
                      }}</template>
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-select
                      v-model="filter.type"
                      label="Typ"
                      :items="availableTypes"
                      item-text="desc"
                      item-value="val"
                    >
                    </v-select>
                  </v-col>
                  <v-col>
                    <v-select
                      v-model="filter.negotiation"
                      label="Verhandlungsbasis"
                      :items="yesno"
                      item-text="desc"
                      item-value="val"
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-select
                      v-model="filter.delivery"
                      label="Lieferung möglich/gewünscht"
                      :items="yesno"
                      item-text="desc"
                      item-value="val"
                    >
                    </v-select>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      v-model="filter.plzFrom"
                      label="PLZ Bereich von..."
                      :rules="validationRules.fieldPLZArea"
                      placeholder="87"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      v-model="filter.plzTo"
                      label="PLZ Bereich bis..."
                      :rules="validationRules.fieldPLZArea"
                      placeholder="95"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="text-center">
                    <v-btn @click="clearFilter()">Filter zurücksetzen</v-btn>
                  </v-col>
                  <v-col class="text-center">
                    <v-btn color="primary" @click="executeFilter()"
                      >Filter anwenden</v-btn
                    >
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <!--
          Gesuche
          <v-switch
            v-model="offer"
            @change="toggleOffer"
            class="ml-4 mr-4"
          ></v-switch
          >Angebote-->
        </v-card-title>
      </div>
      <v-card-text>
        <!--
        <div class="mt-0 mb-8">
          <v-text-field
            v-model="searchTerm"
            append-icon="search"
            label="Suche"
            single-line
            hide-details
          ></v-text-field>
        </div>-->
        <RequestList
          :items="items"
          :loading="loading"
          :isPagination="true"
          :isWhatchlist="true"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import RequestList from "./_components/RequestList";
import Map from "@/components/Map";
import {
  /*getOffers, getRequests,*/ getOffersAndRequests,
  getParentOrigins,
} from "./_api";
import { getProductInformation } from "@/modules/Products/_api";
import { fieldPLZArea } from "@/util/form-validation";

export default {
  name: "RequestOverviewList",
  components: {
    RequestList,
    Map,
  },
  data() {
    return {
      validationRules: {
        fieldPLZArea: fieldPLZArea,
      },
      availableTypes: [
        {
          desc: "Angebot",
          val: true,
        },
        {
          desc: "Gesuch",
          val: false,
        },
      ],
      yesno: [
        {
          desc: "Ja",
          val: true,
        },
        {
          desc: "Nein",
          val: false,
        },
      ],
      availableProducts: [],
      loading: true,
      offer: true,
      items: [],
      originalItems: [],
      availableOrigins: [],
      filterUnfolded: false,
      filter: {
        searchTerm: "",
        origin: null,
        product: null,
        type: null,
        negotiation: null,
        delivery: null,
        plzFrom: null,
        plzTo: null,
      },
      defaultFilter: {
        searchTerm: "",
        origin: null,
        product: null,
        type: null,
        negotiation: null,
        delivery: null,
        plzFrom: null,
        plzTo: null,
      },
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    getItemText(item) {
      if (item.title && item.unit) {
        if (item.unit.symbol) {
          return item.title.description + "/" + item.unit.symbol;
        }
        return item.title.description + "/" + item.unit.description;
      }
      return "";
    },
    executeFilter() {
      this.loading = true;
      this.items = this.originalItems;

      //PLZ from filter
      if (this.filter.plzFrom != null) {
        var plzFromFilter = this.filter.plzFrom;
        if (plzFromFilter.length < 5) {
          plzFromFilter += "0".repeat(5 - plzFromFilter.length);
        }
        this.filter.plzFrom = plzFromFilter;
        this.items = this.items.filter(function(item) {
          return item["plz"] >= plzFromFilter;
        });
      }

      //PLZ to filter
      if (this.filter.plzTo != null) {
        var plzToFilter = this.filter.plzTo;
        if (plzToFilter.length < 5) {
          plzToFilter += "0".repeat(5 - plzToFilter.length);
        }
        this.filter.plzTo = plzToFilter;
        this.items = this.items.filter(function(item) {
          return item["plz"] <= plzToFilter;
        });
      }

      //Delivery filter
      if (this.filter.delivery != null) {
        var deliveryFilter = this.filter.delivery;
        this.items = this.items.filter(function(item) {
          return item["delivery"] == deliveryFilter;
        });
      }

      //Negotiation filter
      if (this.filter.negotiation != null) {
        var negotiationFilter = this.filter.negotiation;
        this.items = this.items.filter(function(item) {
          return item["negotiation"] == negotiationFilter;
        });
      }

      //Type filter
      if (this.filter.type != null) {
        var typeFilter = this.filter.type;
        this.items = this.items.filter(function(item) {
          return item["isOffer"] == typeFilter;
        });
      }

      //Product filter
      if (
        this.filter.product != null &&
        this.filter.product._id != null &&
        this.filter.product._id != ""
      ) {
        var productFilter = this.filter.product._id;
        this.items = this.items.filter(function(item) {
          return (
            item["product"] != undefined &&
            item["product"]["_id"] != undefined &&
            item["product"]["_id"] == productFilter
          );
        });
      }

      //Origin filter
      if (this.filter.origin != null && this.filter.origin != "") {
        var originFilter = this.filter.origin;
        this.items = this.items.filter(function(item) {
          return (
            item["origin"] != undefined &&
            item["origin"]["_id"] != undefined &&
            item["origin"]["_id"] == originFilter
          );
        });
      }

      //Filter general search term
      if (this.filter.searchTerm != "") {
        var textFilterObjects = [
          "title",
          "description",
          "features",
          "origin.description",
          "subOrigin.description",
          "product.title.description",
          "usage",
        ];
        var searchTextFilter = this.filter.searchTerm.toLowerCase();
        this.items = this.items.filter(function(item) {
          return textFilterObjects.some(function(val) {
            var splittedValues = val.split(".");
            if (splittedValues.length == 1) {
              return (
                item[val] != undefined &&
                item[val].toLowerCase().includes(searchTextFilter)
              );
            } else if (splittedValues.length == 2) {
              return (
                item[splittedValues[0]] != undefined &&
                item[splittedValues[0]][splittedValues[1]] != undefined &&
                item[splittedValues[0]][splittedValues[1]]
                  .toLowerCase()
                  .includes(searchTextFilter)
              );
            } else if (splittedValues.length == 3) {
              return (
                item[splittedValues[0]] != undefined &&
                item[splittedValues[0]][splittedValues[1]] != undefined &&
                item[splittedValues[0]][splittedValues[1]][splittedValues[2]] !=
                  undefined &&
                item[splittedValues[0]][splittedValues[1]][splittedValues[2]]
                  .toLowerCase()
                  .includes(searchTextFilter)
              );
            } else {
              return false;
            }
          });
        });
      }

      this.loading = false;
    },
    clearFilter() {
      this.filter = this.defaultFilter;
      this.items = this.originalItems;
    },
    async init() {
      this.loading = true;
      this.filter = Object.assign({}, this.defaultFilter);
      await getOffersAndRequests().then((res) => {
        if (res.data.data) {
          this.items = res.data.data;
          this.originalItems = res.data.data;
        }
      });

      await getParentOrigins().then((res) => {
        if (res.data.origins) {
          this.availableOrigins = res.data.origins;
        }
      });

      await getProductInformation().then((res) => {
        if (res.data.products) {
          this.availableProducts = res.data.products;
        }
      });

      this.loading = false;

      /*
      if (this.offer) {
        getOffers()
          .then(res => {
            if (res.data.offers) {
              this.items = res.data.offers;
            }
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        getRequests()
          .then(res => {
            if (res.data.requests) {
              this.items = res.data.requests;
            }
          })
          .finally(() => {
            this.loading = false;
          });
      }*/
    },
    changeFilterUnfolded() {
      this.filterUnfolded = !this.filterUnfolded;
    },
  },
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.xs;
    },
  },
};
</script>
