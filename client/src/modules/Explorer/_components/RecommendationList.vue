<template>
  <v-card>
    <v-card-title>
      Vorschläge zu Ihrem {{ request.isOffer ? "Angebot" : "Gesuch" }}
    </v-card-title>
    <v-card-text>
      <RequestList
        :items="items"
        :loading="loading"
        :isPagination="true"
        :isWhatchlist="true"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import RequestList from "./RequestList";
import { getOffers, getRequests } from "../_api";

export default {
  name: "RecommendationList",
  components: {
    RequestList,
  },
  props: {
    request: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      items: [],
    };
  },
  async mounted() {
    await this.init();
    this.executeFilter();
  },
  methods: {
    executeFilter() {
      this.loading = true;
      var searchTerm = this.request.product.title.description;
      //Filter general search term
      var textFilterObjects = [
        "title",
        "description",
        "features",
        "origin.description",
        "subOrigin.description",
        "product.title.description",
        "usage",
      ];
      var searchTextFilter = searchTerm.toLowerCase();
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
      // Filter for different user
      var userId = this.request.ownerId;
      this.items = this.items.filter(function(item) {
        return item["ownerId"] != undefined && item["ownerId"] != userId;
      });
      this.loading = false;
    },
    async init() {
      if (!this.request.isOffer) {
        await getOffers().then((res) => {
          if (res.data.offers) {
            this.items = res.data.offers;
          }
        });
      } else {
        await getRequests().then((res) => {
          if (res.data.requests) {
            this.items = res.data.requests;
          }
        });
      }
      this.loading = false;
    },
  },
};
</script>
