<template>
  <v-container>
    <v-card>
      <v-card-title>Übersicht über alle Nachrichten</v-card-title>
      <v-card-text>
        <v-row>
          <v-col align="center" justify="center">
            <v-card class="orange">
              <v-card-title>Neue Nachrichten</v-card-title>
              <v-card-text>
                <NewCommunicationsOverview />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col align="center" justify="center">
            <v-card class="grey">
              <v-card-title>Nachrichten ohne Rückmeldung</v-card-title>
              <v-card-text>
                <OwnCommunicationOverview />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col align="center" justify="center">
            <v-card class="grey">
              <v-card-title
                >Nachrichten zu meinen Angeboten/Gesuchen</v-card-title
              >
              <v-card-text>
                <OtherCommunicationOverview />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import OwnCommunicationOverview from "./_components/OwnCommunicationOverview";
import OtherCommunicationOverview from "./_components/OtherCommunicationOverview";
import NewCommunicationsOverview from "./_components/NewCommunicationsOverview";
export default {
  name: "RequestCommunications",
  components: {
    OwnCommunicationOverview,
    OtherCommunicationOverview,
    NewCommunicationsOverview,
  },
};
</script>

<!-- Lösche isNewMessage wenn Klick auf Kommunikation im Gesuch/Angebot Detail
    -->
