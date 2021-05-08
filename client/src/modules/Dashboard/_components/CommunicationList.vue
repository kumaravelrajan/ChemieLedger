<template>
  <v-data-table
    :headers="headers"
    :items="items"
    item-key="_id"
    multi-sort
    no-data-text="Keine Einträge vorhanden..."
    class="elevation-1"
    :loading="loading"
    loading-text="Daten werden geladen..."
    :footer-props="footerOptions"    
    :hide-default-header="isMobile"
  >
    <template v-slot:item.price="{ item }">{{ item.price }} €</template>
    <template v-slot:item.isOffer="{ item }">{{
      item.isOffer ? "Angebot" : "Gesuch"
    }}</template>
    <template v-slot:item.action="{ item }">
      <v-icon small class="mr-2" @click="linkTo(item.requestId)"
        >remove_red_eye</v-icon
      >
    </template>
    <template v-slot:item.updatedAt="{ item }">{{
      item.updatedAt | formatDateTime
    }}</template>
  </v-data-table>
</template>
<script>
export default {
  name: "CommunicationList",
  props: {
    items: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      footerOptions: {
        itemsPerPageText: "Einträge pro Seite",
        itemsPerPageAllText: "Alle"
      },
      headers: [
        {
          text: "Produkt",
          value: "product"
        },
        {
          text: "Nachricht vom...",
          value: "updatedAt"
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
        {
          text: "Typ",
          value: "isOffer"
        },
        { text: "", value: "action", sortable: false }
      ]
    };
  },
  methods: {
    linkTo(requestId) {
      this.$router.push({ path: "/explorer/viewrequest/" + requestId });
    }
  },
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.xs
    }
  }
};
</script>
