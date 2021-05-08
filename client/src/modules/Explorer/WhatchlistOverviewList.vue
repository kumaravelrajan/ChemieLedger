<template>
  <v-card class="elevation-1 pa-4 ma-4">
    <v-card-title>
      Merkliste
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-dialog v-model="communicationDialog" max-width="600px">
          <v-form
            @submit.prevent="sendCommunicationRequests"
            v-model="communicationRequestValid"
            ref="communicationRequest"
          >
            <v-card>
              <v-card-title>
                <span class="headline">Sammelanfrage stellen</span>
              </v-card-title>
              <v-card-text>
                <v-row v-if="sendRequests">
                  <v-col class="text-center">
                    <v-progress-circular
                      indeterminate
                      color="primary"
                    ></v-progress-circular>
                  </v-col>
                </v-row>

                <v-text-field
                  v-if="!sendRequests"
                  v-model="communicationRequestText"
                  label="Nachricht"
                  required
                  :disabled="sendRequests"
                  :rules="validationRules.fieldRequired"
                  ><template v-slot:prepend>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on">info</v-icon>
                      </template>
                      Diese Nachricht wird an die Gesuche/Angebote der Merkliste
                      gesendet, sollte noch keine Kommunikation bestehen.
                    </v-tooltip>
                  </template></v-text-field
                >
              </v-card-text>
              <v-card-actions v-if="!sendRequests">
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close"
                  >Schliessen</v-btn
                >
                <v-btn color="blue darken-1" text type="submit">Senden</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
      </v-row>
      <RequestList
        :items="items"
        :loading="loading"
        :isPagination="false"
        :isWhatchlist="true"
        :showSum="true"
        @whatchlistitemRemoved="removeItem"
      />
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-icon v-on="on">info</v-icon>
        </template>
        Allen Angeboten und Gesuchen in der Merkliste wird eine Anfrage
        gesendet. Ausgenommen sind diejenigen, die bereits eine Anfrage von
        Ihnen erhalten haben oder Angebote und Gesuche, welche Sie eingestellt
        haben.
      </v-tooltip>
      <v-btn type="submit" color="primary" @click="openDialog"
        >Sammelanfrage</v-btn
      >
    </v-card-actions>
  </v-card>
</template>
<script>
import RequestList from "./_components/RequestList";
import { getWhatchlistRequests, postCommunicationRequest } from "./_api";
import { fieldRequired } from "@/util/form-validation";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";

export default {
  name: "WhatchlistOverviewList",
  components: {
    RequestList
  },
  props: {},
  data() {
    return {
      loading: true,
      items: [],
      communicationRequestText: "",
      communicationDialog: false,
      communicationRequestValid: false,
      sendRequests: false,
      requestSendedCounter: 0,
      validationRules: {
        fieldRequired: fieldRequired
      }
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    async sendCommunicationRequests() {
      if (this.$refs.communicationRequest.validate()) {
        this.sendRequests = true;
        this.requestSendedCounter = 0;
        for (var i = 0; i < this.items.length; i++) {
          await postCommunicationRequest(this.items[i]._id, {
            message: this.communicationRequestText
          }).then(res => {
            if (res.data.success) {
              this.requestSendedCounter += 1;
            }
          });
        }
        this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
          type: "success",
          msg: "Anfragen wurden erfolgreich versendet."
        });
        this.sendRequests = false;
        this.requestSendedCounter = 0;
        this.close();
      }
    },
    openDialog() {
      this.communicationRequestText = "";
      this.communicationDialog = true;
    },
    close() {
      this.communicationRequestText = "";
      this.communicationDialog = false;
      this.$refs.communicationRequest.reset();
    },
    init() {
      this.sendRequests = false;
      this.requestSendedCounter = 0;
      this.loading = true;
      this.communicationRequestText = "";
      this.communicationDialog = false;
      getWhatchlistRequests()
        .then(res => {
          if (res.data.data) {
            this.items = res.data.data;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    removeItem(index) {
      this.items.splice(index, 1);
    }
  }
};
</script>
