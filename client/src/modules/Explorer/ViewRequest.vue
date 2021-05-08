<template>
  <v-container>
    <v-row v-if="loading">
      <v-col align="center" justify="center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-col>
    </v-row>
    <v-card
      v-if="request && !loading && userInfo._id == request.ownerId"
      class="mb-4"
    >
      <v-card-title>Administration</v-card-title>
      <v-card-text v-if="!request.isClosed">
        <v-dialog v-model="closeRequestDialog" max-width="600px">
          <v-form
            @submit.prevent="closeRequest"
            v-model="closeRequestValidation"
            ref="closeRequestForm"
          >
            <v-card>
              <v-card-title>
                <span class="headline"
                  >{{ request.isOffer ? "Angebot" : "Gesuch" }} schließen</span
                >
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col align="center" justify="center">
                    Ist ein Handel zum
                    {{ request.isOffer ? "Angebot" : "Gesuch" }} zustande
                    gekommen? <br />Geben Sie bitte einen Endpreis und die Menge
                    des Handels an...
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="request.price"
                      label="Preis"
                      type="number"
                      step=".01"
                      suffix="€"
                      :rules="validationRules.fieldRequired"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="request.amount"
                      label="Menge"
                      type="number"
                      step=".1"
                      :suffix="
                        request.product &&
                        request.product.unit &&
                        request.product.unit.symbol
                          ? request.product.unit.symbol
                          : ''
                      "
                      :rules="validationRules.fieldRequired"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col align="center" justify="center">
                    <v-btn color="secondary" @click="close" class="mr-4"
                      >Zurück</v-btn
                    >
                    <v-btn color="primary" type="submit">Absenden</v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="mr-2" @click="closeRequestWithoutDeal"
                  >Schließen</v-btn
                >ohne Abschluss
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
        <v-row>
          <v-col justify="center" align="center">
            <v-btn color="primary" @click="editItem()" class="mr-4"
              >Editieren</v-btn
            >
            <v-btn
              color="secondary"
              v-if="request.isDraft"
              @click="deleteAndBack()"
              >Verbindlich löschen</v-btn
            >
            <v-btn
              color="secondary"
              v-if="!request.isDraft"
              @click="disableRequest()"
              >{{ request.isOffer ? "Angebot" : "Gesuch" }} schließen</v-btn
            >
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text v-else>
        <v-row>
          <v-col justify="center" align="center"
            >Diese Angebot wurde geschlossen.</v-col
          >
        </v-row>
      </v-card-text>
    </v-card>
    <v-card v-if="request && !loading" class="mb-4">
      <v-card-title
        >Detailansicht
        {{ request.isOffer ? "Angebot" : "Gesuch" }}</v-card-title
      >
      <v-card-text>
        <v-row>
          <v-col :cols="isMobile? 12 : 6">
            Titel:
            <v-chip>{{ request.title }}</v-chip>
          </v-col>
          <v-col>
            Produkt:
            <v-chip>{{ getProductName() }}</v-chip>
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="isMobile? 12 : 6">
            Menge:
            <v-chip>{{ request.amount }}</v-chip>
          </v-col>
          <v-col>
            Preis:
            <v-chip>{{ request.price + " €" }}</v-chip>
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="isMobile? 12 : 6">
            Herkunft:
            <v-chip v-if="request.origin && request.origin.description">{{
              request.origin.description
            }}</v-chip>
            <v-chip v-else>-</v-chip>
          </v-col>
          <v-col>
            Kategorie:
            <v-chip v-if="request.subOrigin && request.subOrigin.description">{{
              request.subOrigin.description
            }}</v-chip>
            <v-chip v-else>-</v-chip>
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="isMobile? 12 : 6">
            PLZ: <v-chip>{{ request.plz || "-" }}</v-chip></v-col
          >
          <v-col>Merkmale: {{ request.features || "-" }}</v-col>
        </v-row>
        <v-row>
          <v-col :cols="isMobile? 12 : 6">
            {{ request.isOffer ? "Verfügbar zum..." : "Gesucht zum..." }}
            <v-chip>{{ request.availableTo | formatDateTime }}</v-chip>
          </v-col>
          <v-col>
            Zuletzt geändert:
            <v-chip>{{ request.updatedAt | formatDateTime }}</v-chip>
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="isMobile? 12 : 6">
            Verhandlungsbasis:
            <v-chip>{{ request.negotiation ? "Ja" : "Nein" }}</v-chip>
          </v-col>
          <v-col>
            {{ request.isOffer ? "Lieferung möglich" : "Lieferung erwünscht" }}
            <v-chip>{{ request.delivery ? "Ja" : "Nein" }}</v-chip>
          </v-col>
        </v-row>
        <v-row>
          <v-col>Verwendungszweck: {{ request.usage || "-" }}</v-col>
        </v-row>
        <v-row>
          <v-col>Beschreibung: {{ request.description || "-" }}</v-col>
        </v-row>
        <v-row v-if="request.imgPaths.length > 0">
          <v-col>
            <div>Fotos</div>
            <v-slide-group
              v-if="request.imgPaths.length > 0"
              justify="center"
              class="mb-2 mt-10"
              show-arrows
            >
              <v-slide-item
                v-for="src in request.imgPaths"
                :key="src"
                class="mr-1"
              >
                <v-img
                  :src="receiveImagePath(src)"
                  max-height="150px"
                  max-width="200px"
                ></v-img>
              </v-slide-item>
            </v-slide-group>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card v-if="request && !loading" class="mb-4">
      <v-card-title>Anfragen</v-card-title>
      <v-card-text>
        <CommunicationChat :userId="userInfo._id" :request="request" />
      </v-card-text>
    </v-card>
    <v-card v-if="request && !loading && userInfo._id == request.ownerId">
      <RecommendationList :request="request" />
    </v-card>
  </v-container>
</template>
<script>
import moment from "moment";
import {
  getRequest,
  getImageURL,
  deleteRequest,
  postCloseRequest,
  postCloseRequestWithoutDeal
} from "./_api";
import { mapGetters } from "vuex";
import {
  STORE_KEY as AUTH_STORE_KEY,
  GETTER_USER_INFORMATION as AUTH_GET_USER_INFORMATION
} from "@/store/modules/AUTHENTICATION/constants";
import CommunicationChat from "./_components/CommunicationChat";
import RecommendationList from "./_components/RecommendationList";
import { fieldRequired } from "@/util/form-validation";

export default {
  name: "ViewRequest",
  props: {
    requestId: {
      type: String,
      required: true
    }
  },
  components: {
    CommunicationChat,
    RecommendationList
  },
  data() {
    return {
      closeRequestDialog: false,
      closeRequestValidation: false,
      validationRules: {
        fieldRequired: fieldRequired
      },
      loading: true,
      request: {
        title: "",
        amount: 0,
        availableTo: moment(new Date()).format("YYYY-MM-DD"),
        usage: "",
        features: "",
        description: "",
        price: 0,
        negotiation: false,
        delivery: false,
        product: {
          unit: null,
          title: null
        },
        isOffer: null,
        imgPaths: [],
        origin: null,
        subOrigin: null,
        isDraft: true
      }
    };
  },
  computed: {
    ...mapGetters({
      userInfo: AUTH_STORE_KEY + "/" + AUTH_GET_USER_INFORMATION
    }),
    isMobile() {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    getProductName() {
      if (
        this.request.product &&
        this.request.product.unit &&
        this.request.product.title
      ) {
        var unit = this.request.product.unit.symbol
          ? this.request.product.unit.symbol
          : this.request.product.unit.description;
        return this.request.product.title.description + " / " + unit;
      }
      return "-";
    },
    receiveImagePath(path) {
      return getImageURL(path);
    },
    deleteAndBack() {
      deleteRequest(this.request._id).then(res => {
        if (res.data.success) {
          this.$router.go(-1);
        }
      });
    },
    editItem() {
      this.$router.push({ path: "/explorer/editrequest/" + this.request._id });
    },
    disableRequest() {
      this.closeRequestDialog = true;
    },
    closeRequest() {
      if (this.$refs.closeRequestForm.validate()) {
        postCloseRequest(this.request._id, {
          price: this.request.price,
          amount: this.request.amount
        })
          .then(res => {
            if (res.data.success) {
              this.request = Object.assign({}, this.request, {
                isClosed: true
              });
            }
          })
          .finally(() => {
            this.closeRequestDialog = false;
          });
      }
    },
    closeRequestWithoutDeal() {
      postCloseRequestWithoutDeal(this.request._id)
        .then(res => {
          if (res.data.success) {
            this.request = Object.assign({}, this.request, {
              isClosed: true
            });
          }
        })
        .finally(() => {
          this.closeRequestDialog = false;
        });
    },
    close() {
      this.closeRequestDialog = false;
    }
  },
  mounted() {
    getRequest(this.requestId)
      .then(res => {
        if (res.data.request) {
          this.request = Object.assign({}, this.request, res.data.request);
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }
};
</script>
