<template>
  <v-card class="elevation-1 pa-4 ma-4">
    <v-card-title>
      Meine {{ isClosed ? "archivierten" : "" }} Angebote/Gesuche
      <!--
      Meine {{ isClosed ? "geschlossenen" : "" }} Gesuche
      {{ isDraft ? "im Entwurf" : "" }}
      <v-switch
        v-model="offer"
        @change="toggleOffer"
        class="ml-4 mr-4"
      ></v-switch>
      Meine {{ isClosed ? "geschlossenen" : "" }} Angebote
      {{ isDraft ? "im Entwurf" : "" }}
    -->
    </v-card-title>
    <v-card-text>
      <RequestList :items="items" :isPagination="true" :loading="loading" />
    </v-card-text>
  </v-card>
</template>
<script>
import RequestList from "./_components/RequestList";
import {
  getOwnDraftOffersAndRequests,
  getOwnClosedOffersAndRequests,
  getOwnOffersAndRequests /*
  getOwnOffers,
  getOwnRequests,
  getOwnDraftOffers,
  getOwnDraftRequests,
  getOwnArchiveOffers,
  getOwnArchiveRequests*/
} from "./_api";

export default {
  name: "OwnRequestOverviewList",
  components: {
    RequestList
  },
  props: {
    isDraft: {
      type: Boolean,
      default: false
    },
    isClosed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: true,
      offer: true,
      items: []
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.loading = true;
      if (this.isDraft) {
        getOwnDraftOffersAndRequests()
          .then(res => {
            if (res.data.offers) {
              this.items = res.data.offers;
            }
          })
          .finally(() => {
            this.loading = false;
          });
        /*
        if (this.offer) {
          getOwnDraftOffers()
            .then(res => {
              if (res.data.offers) {
                this.items = res.data.offers;
              }
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          getOwnDraftRequests()
            .then(res => {
              if (res.data.requests) {
                this.items = res.data.requests;
              }
            })
            .finally(() => {
              this.loading = false;
            });
        }
        */
      } else if (this.isClosed) {
        getOwnClosedOffersAndRequests()
          .then(res => {
            if (res.data.offers) {
              this.items = res.data.offers;
            }
          })
          .finally(() => {
            this.loading = false;
          });
        /*
        if (this.offer) {
          getOwnArchiveOffers()
            .then(res => {
              if (res.data.offers) {
                this.items = res.data.offers;
              }
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          getOwnArchiveRequests()
            .then(res => {
              if (res.data.requests) {
                this.items = res.data.requests;
              }
            })
            .finally(() => {
              this.loading = false;
            });
        }
        */
      } else {
        getOwnOffersAndRequests()
          .then(res => {
            if (res.data.offers) {
              this.items = res.data.offers;
            }
          })
          .finally(() => {
            this.loading = false;
          });
        /*
        if (this.offer) {
          getOwnOffers()
            .then(res => {
              if (res.data.offers) {
                this.items = res.data.offers;
              }
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          getOwnRequests()
            .then(res => {
              if (res.data.requests) {
                this.items = res.data.requests;
              }
            })
            .finally(() => {
              this.loading = false;
            });
        }
        */
      }
    } /*,
    toggleOffer() {
      this.init();
    }*/
  }
};
</script>
