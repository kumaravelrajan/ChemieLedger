<template>
  <v-data-table
    v-model="selectedItems"
    item-key="_id"
    :show-select="sendRequests"
    :search="searchTerm"
    :items="items"
    :loading="initialLoading || loading"
    :headers="headers"
    :single-expand="singleExpand"
    :expanded.sync="expanded"
    :hide-default-footer="!isPagination"
    :disable-pagination="!isPagination"
    :footer-props="footerOptions"
    show-expand
    class="elevation-1"
    multi-sort
    no-data-text="Keine Einträge vorhanden..."
    no-results-text="Keine Einträge für diese Suche..."
    loading-text="Daten werden geladen..."
    :hide-default-header="isMobile"
  >
    <template v-slot:item.price="{ item }">{{ item.price }} €</template>
    <template v-slot:item.isOffer="{ item }">{{
      item.isOffer ? "Angebot" : "Gesuch"
    }}</template>

    <template v-slot:item.unit="{ item }">
      {{
        item.product
          ? item.product.unit && item.product.unit.symbol
            ? item.product.unit.symbol
            : item.product.unit.description
          : ""
      }}
    </template>

    <template v-slot:item.updatedAt="{ item }">{{
      item.updatedAt | formatDateTime
    }}</template>

    <template v-slot:expanded-item="{ headers, item }">
      <td :colspan="headers.length">
        <v-container>
          <!--
          <v-row class="ml-12">
            <v-col v-if="item.updatedAt"
              >Zuletzt geändert: {{ item.updatedAt | formatDateTime }}</v-col
            >
          </v-row>-->
          <v-row :class="{'ml-12': (!isMobile)}">
            <v-col :cols="isMobile? 12 : 6">
              Herkunft:
              <v-chip v-if="item.origin && item.origin.description">{{
                item.origin.description
              }}</v-chip>
              <v-chip v-else>-</v-chip>
            </v-col>
            <v-col>
              Kategorie:
              <v-chip v-if="item.subOrigin && item.subOrigin.description">{{
                item.subOrigin.description
              }}</v-chip>
              <v-chip v-else>-</v-chip>
            </v-col>
          </v-row>
          <!-- Um chips nach rechts zu verschieben class="float-right" -->
          <v-row :class="{'ml-12': (!isMobile)}">
            <v-col :cols="isMobile? 12 : 6">
              Merkmale: {{ item.features || "-" }}
            </v-col>
            <v-col
              >PLZ: <v-chip>{{ item.plz || "-" }}</v-chip></v-col
            >
          </v-row>
          <v-row :class="{'ml-12': (!isMobile)}">
            <v-col :cols="isMobile? 12 : 6">
              Verhandlungsbasis:
              <v-chip>{{ item.negotiation ? "Ja" : "Nein" }}</v-chip>
            </v-col>
            <v-col>
              {{ item.isOffer ? "Lieferung möglich" : "Lieferung erwünscht" }}
              <v-chip>{{ item.delivery ? "Ja" : "Nein" }}</v-chip>
            </v-col>
          </v-row>
          <v-row :class="{'ml-12': (!isMobile)}">
            <v-col :cols="isMobile? 12 : 6">
              Verwendungszweck: {{ item.usage || "-" }}
            </v-col>
          </v-row>
          <v-row :class="{'ml-12': (!isMobile)}">
            <v-col :cols="isMobile? 12 : 6">
              Beschreibung: {{ item.description || "-" }}
            </v-col>
          </v-row>
          <v-row :class="{'ml-12': (!isMobile)}" v-if="item.imgPaths.length > 0">
            <v-col>
              <div>Fotos</div>
              <v-slide-group class="mb-2 mt-10" show-arrows>
                <v-slide-item
                  v-for="src in item.imgPaths"
                  :key="item._id + src"
                  class="mr-1"
                >
                  <v-img
                    :src="receiveImagePath(src)"
                    height="150px"
                    max-width="200px"
                  ></v-img>
                </v-slide-item>
              </v-slide-group>
            </v-col>
          </v-row>
          <v-row>
            <v-col align="right" justify="right">
              <v-btn class="mr-2" @click="linkTo(item._id)">Details</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </td>
    </template>

    <template v-slot:item.action="{ item }" v-if="isWhatchlist">
      <v-icon
        v-if="whatchListItemIds != null && whatchListItemIds.includes(item._id)
          && item.ownerId != userInformation._id"
        @click="removeFromWhatchlist(item)"
        >favorite</v-icon
      >
      <v-icon v-else-if="item.ownerId != userInformation._id" @click="addToWhatchlist(item._id)">favorite_border</v-icon>
    </template>

    <template v-if="showSum" v-slot:body.append>
      <tr>
        <td v-if="sendRequests && !isMobile"></td>
        <td>
          Summe
          <span v-if="isMobile" class="float-right">
            {{ getPriceAmount }} €
          </span>
        </td>
        <td v-if="!isMobile"></td>
        <td v-if="!isMobile"></td>
        <td v-if="!isMobile"></td>
        <td v-if="!isMobile"></td>
        <td v-if="!isMobile"></td>
        <td v-if="!isMobile">{{ getPriceAmount }} €</td>
      </tr>
    </template>
  </v-data-table>
</template>
<script>
import { mapGetters } from "vuex";
import {
  getImageURL,
  getWhatchlistIds,
  addItemToWhatchlist,
  removeItemFromWhatchlist
} from "../_api";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";
import {
  STORE_KEY as AUTH_STORE_KEY,
  GETTER_USER_INFORMATION as AUTH_GET_USER_INFORMATION,
} from "@/store/modules/AUTHENTICATION/constants";

export default {
  name: "RequestList",

  props: {
    items: {
      type: Array,
      required: true,
      default: null
    },
    sendRequests: {
      type: Boolean,
      default: false
    },
    isPagination: {
      type: Boolean,
      default: false
    },
    showSearchBar: {
      type: Boolean,
      default: false
    },
    searchTerm: {
      type: String,
      default: ""
    },
    loading: {
      type: Boolean,
      required: true
    },
    singleExpand: {
      type: Boolean,
      default: true
    },
    isWhatchlist: {
      type: Boolean,
      default: false
    },
    showSum: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      initialLoading: true,
      selectedItems: [],
      whatchListItemIds: [],
      footerOptions: {
        itemsPerPageText: "Einträge pro Seite",
        itemsPerPageAllText: "Alle"
      },
      expanded: [],
      headers: [
        {
          text: "Titel",
          align: "left",
          value: "title"
        },
        {
          text: "Datum",
          value: "updatedAt"
        },
        {
          text: "Produkt",
          value: "product.title.description"
        },
        {
          text: "Typ",
          value: "isOffer"
        },
        {
          text: "Menge",
          value: "amount"
        },
        {
          text: "Einheit",
          value: "unit"
        },
        {
          text: "Preis",
          value: "price"
        },
        { text: "", value: "action", sortable: false },
        { text: "", value: "data-table-expand" }
      ]
    };
  },
  computed: {
    getPriceAmount: function() {
      var price = 0;
      this.items.forEach(function(el) {
        if (el.price) {
          price += el.price;
        }
      });
      return price;
    },
    isMobile() {
      return this.$vuetify.breakpoint.xs
    },
    ...mapGetters({
      userInformation: AUTH_STORE_KEY + "/" + AUTH_GET_USER_INFORMATION
    })
  },
  methods: {
    addToWhatchlist(id) {
      addItemToWhatchlist(id).then(res => {
        if (res.data.success) {
          this.whatchListItemIds.push(id);
        } else {
          this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
            type: "error",
            msg:
              "Es ist ein Fehler beim hinzufügen in die Whatchlist aufgetreten."
          });
        }
      });
    },
    removeFromWhatchlist(item) {
      removeItemFromWhatchlist(item._id).then(res => {
        if (res.data.success) {
          this.$emit("whatchlistitemRemoved", this.items.indexOf(item));
          this.whatchListItemIds.splice(
            this.whatchListItemIds.indexOf(item._id),
            1
          );
        } else {
          this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
            type: "error",
            msg: "Es ist ein Fehler beim löschen in die Whatchlist aufgetreten."
          });
        }
      });
    },
    receiveImagePath(path) {
      return getImageURL(path);
    },
    linkTo(requestId) {
      this.$router.push({ path: "/explorer/viewrequest/" + requestId });
    }
  },
  mounted() {
    if (this.$props.isWhatchlist) {
      getWhatchlistIds()
        .then(res => {
          if (res.data.ids) {
            this.whatchListItemIds = res.data.ids;
          }
        })
        .finally(() => {
          this.initialLoading = false;
        });
    } else {
      this.initialLoading = false;
    }
  }
};
</script>
