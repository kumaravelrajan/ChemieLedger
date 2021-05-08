<template>
  <v-container class="ma-0 pa-0">
    <v-row v-if="loading">
      <v-col align="center" justify="center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-col>
    </v-row>
    <v-row
      v-if="!loading && userId == request.ownerId && communications.length < 1"
    >
      <v-col justify="center" align="center"
        >Sie haben noch keine Anfragen auf Ihr
        {{ request.isOffer ? "Angebot" : "Gesuch" }}</v-col
      >
    </v-row>
    <v-row
      v-if="!loading && userId != request.ownerId && communications.length < 1"
    >
      <v-col justify="center" align="center">
        <v-btn color="primary" @click="openDialog">Anfrage stellen</v-btn>
      </v-col>
      <v-dialog v-model="communicationDialog" max-width="600px">
        <v-form
          @submit.prevent="sendCommunicationRequest"
          v-model="communicationRequestValid"
          ref="communicationRequest"
        >
          <v-card>
            <v-card-title>
              <span class="headline">Anfrage stellen</span>
            </v-card-title>
            <v-card-text>
              <v-textarea
                v-model="communicationRequestText"
                label="Nachricht"
                required
                :rules="validationRules.fieldRequired"
              ></v-textarea>
            </v-card-text>
            <v-card-actions>
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
    <v-row v-if="!loading && communications.length > 0">
      <v-col>
        <v-card>
          <v-list shaped>
            <v-subheader>Kommunikation mit... </v-subheader>
            <v-list-item-group v-model="activeCommunication" color="primary">
              <v-list-item
                v-for="(item, i) in communications"
                :key="item._id"
                @click="selectCommunicationChannel(i,
                          userId == request.ownerId
                          ? item.initialSender
                          : request.ownerId)"
                :class="
                  item.isNewMessage && item.lastModified != userInformation._id
                    ? 'newmessage'
                    : ''
                "
              >
                <v-list-item-content>
                  <NicknameTitle
                    :userId="
                      userId == request.ownerId
                        ? item.initialSender
                        : request.ownerId
                    "
                  />
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
      <v-col>
        <v-card class="mb-5">
          <v-subheader>Nachrichten</v-subheader>
          <template v-if="selectedCommunication">
            <v-row
              v-for="item in selectedCommunication.messages"
              :key="item._id"
              class="mr-5 ml-5"
            >
              <v-col :align="item.sender == userId ? 'right' : 'left'">
                <div>{{ item.text }}</div>
                <div class="caption font-weight-light">
                  {{ item.sender == userId ? userInformation.nickname : communicationPartnerNickname }}
                  {{ item.updatedAt | formatDateTimeWithHours }}
                </div>
              </v-col>
            </v-row>
          </template>
          <v-subheader v-else
            >Bitte wählen Sie eine Kommunikation aus...</v-subheader
          >
        </v-card>
        <v-card v-if="selectedCommunication && !request.isClosed">
          <v-form
            @submit.prevent="sendMessage"
            v-model="sendMessageValid"
            ref="sendMessage"
          >
            <v-row class="mr-5 ml-5">
              <v-col align="center" justify="center">
                <v-textarea
                  v-model="sendMessageText"
                  label="Nachricht schreiben"
                  required
                  :rules="validationRules.fieldRequired"
                ></v-textarea>
              </v-col>
            </v-row>

            <v-row class="mr-5 ml-5">
              <v-col align="center" justify="center">
                <v-btn
                  type="submit"
                  color="primary"
                  justify="center"
                  align="center"
                  >Nachricht senden</v-btn
                >
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import Vue from "vue";
import { mapGetters } from "vuex";
import {
  STORE_KEY as AUTH_STORE_KEY,
  GETTER_USER_INFORMATION as AUTH_GET_USER_INFORMATION,
} from "@/store/modules/AUTHENTICATION/constants";
import {
  getRequestCommunication,
  postCommunicationRequest,
  pushMessage,
  sendMessageRead,
} from "../_api";
import { fieldRequired } from "@/util/form-validation";
import NicknameTitle from "./NicknameTitle";
import { getNicknameFromUserId } from "../_api";

export default {
  name: "CommunicationChat",
  components: {
    NicknameTitle,
  },
  props: {
    userId: {
      type: String,
      required: true,
    },
    request: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeCommunication: null,
      selectedCommunication: null,

      loading: true,

      communicationDialog: false,
      communicationRequestText: "",
      communicationRequestValid: false,

      sendMessageValid: false,
      sendMessageText: "",

      communicationPartnerNickname: "Anonymer Nutzer",

      communications: [],

      validationRules: {
        fieldRequired: fieldRequired,
      },
    };
  },
  computed: {
    ...mapGetters({
      userInformation: AUTH_STORE_KEY + "/" + AUTH_GET_USER_INFORMATION,
    }),
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.loading = true;
      this.communicationRequestText = "";
      this.communicationDialog = false;
      getRequestCommunication(this.request._id)
        .then((res) => {
          if (res.data.communications) {
            this.communications = res.data.communications;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    openDialog() {
      this.communicationRequestText = "";
      this.communicationDialog = true;
    },
    close() {
      this.communicationRequestText = "";
      this.communicationDialog = false;
    },
    sendCommunicationRequest() {
      if (this.$refs.communicationRequest.validate()) {
        postCommunicationRequest(this.request._id, {
          message: this.communicationRequestText,
        }).then((res) => {
          if (res.data.success) {
            this.init();
          }
        });
      }
    },
    sendMessage() {
      if (this.$refs.sendMessage.validate()) {
        pushMessage(this.selectedCommunication._id, {
          message: this.sendMessageText,
        }).then((res) => {
          if (res.data.communication) {
            this.selectedCommunication = Object.assign(
              {},
              res.data.communication
            );
            this.$refs.sendMessage.reset();
          }
        });
      }
    },
    selectCommunicationChannel(index, partnerId) {
      this.communicationPartnerNickname = "Anonymer Nutzer";
      getNicknameFromUserId(partnerId).then(res => {
        if (res.data.nickname) {
          this.communicationPartnerNickname = res.data.nickname;
        }
      });
      this.selectedCommunication = Object.assign(
        {},
        this.communications[index]
      );
      if (this.selectedCommunication.isNewMessage) {
        sendMessageRead(this.selectedCommunication._id).then((res) => {
          if (res.data.success) {
            this.selectedCommunication = Object.assign(
              {},
              this.selectedCommunication,
              { isNewMessage: false }
            );
            Vue.set(this.communications, index, this.selectedCommunication);
          }
        });
      }
    },
  }
};
</script>
<style scoped>
.newmessage {
  background: orange;
  border-bottom-right-radius: 32px !important;
  border-top-right-radius: 32px !important;
}
</style>
