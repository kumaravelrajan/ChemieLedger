<template>
  <v-container fluid pa-0>
    <v-row class="display-1 mt-10 mr-10 ml-10">Hier ging etwas schief</v-row>
    <v-row class="mr-10 ml-10">
      <v-divider></v-divider>
    </v-row>
    <v-row class="mt-4 mr-10 ml-10">
      <v-col class="pa-0">
        <b>Diese Seite konnte nicht gefunden werden.</b>
        <br />
        <br />
        <v-btn color="primary" :to="'/home'">Zurück zur Homepage</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: "NotFound"
};
</script>