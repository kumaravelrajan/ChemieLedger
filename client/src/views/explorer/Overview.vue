<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col align="center" justify="center">
        <v-btn color="primary" :to="'/explorer/addoffer'" class="mr-4">Angebot erstellen</v-btn>
      </v-col>
      <v-col align="center" justify="center">
        <v-btn color="primary" :to="'/explorer/addrequest'" class="mr-4">Gesuch erstellen</v-btn>
      </v-col>
    </v-row>
    <RequestOverviewList />
  </v-container>
</template>
<script>
import { RequestOverviewList } from "@/modules";
export default {
  name: "Overview",
  components: {
    RequestOverviewList
  }
};
</script>