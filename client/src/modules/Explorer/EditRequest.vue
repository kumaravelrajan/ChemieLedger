<template>
  <v-container>
    <v-card>
      <v-card-title>Gesuch/Anfrage editieren...</v-card-title>
      <v-card-text>
        <RequestForm :requestId="requestId" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import RequestForm from "./_components/RequestForm";

export default {
  name: "EditRequest",
  props: {
    requestId: {
      type: String,
      required: true
    }
  },
  components: {
    RequestForm
  }
};
</script>