<template>
  <v-form @submit.prevent="submit" v-model="valid" ref="form">
    <v-card class="elevation-1 pa-4 ma-4">
      <v-card-title>Profil ändern</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              v-model="profileInformation.nickname"
              name="nickname"
              label="Benutzername/Alias"
              type="text"
              :rules="validationRules.fieldRequired"
              required
              ><template v-slot:prepend>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on">info</v-icon>
                  </template>
                  Dieser Name wird anderen Personen auf der Plattform angezeigt.
                </v-tooltip>
              </template>
            </v-text-field>
          </v-col>
          <v-col>
            <v-select
              v-model="profileInformation.origin"
              :items="availableParentOrigins"
              item-text="description"
              item-value="_id"
              label="Ihre primäre Herkunft"
              name="origin"
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            ><v-text-field
              v-model="profileInformation.name"
              name="name"
              label="Vorname"
              type="text"
              :rules="validationRules.fieldRequired"
              required
            ></v-text-field
          ></v-col>
          <v-col
            ><v-text-field
              v-model="profileInformation.surname"
              name="name"
              label="Nachname"
              type="text"
              :rules="validationRules.fieldRequired"
              required
            ></v-text-field
          ></v-col>
        </v-row>
        <v-row>
          <v-col
            ><v-text-field
              v-model="profileInformation.email"
              name="email"
              label="E-Mail"
              type="text"
              :disabled="true"
            ></v-text-field
          ></v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn type="submit" color="primary">Speichern</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
<script>
import { mapGetters } from "vuex";
import { fieldRequired } from "@/util/form-validation";
import {
  STORE_KEY as AUTH_STORE_KEY,
  GETTER_USER_INFORMATION as AUTH_GET_USER_INFORMATION,
  ACTION_CHANGE_PROFILE as AUTH_ACTION_CHANGE_PROFILE
} from "@/store/modules/AUTHENTICATION/constants";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";
import { getOrigins } from "./_api";

export default {
  name: "Profile",
  data() {
    return {
      valid: false,
      validationRules: {
        fieldRequired: fieldRequired
      },
      profileInformation: {
        nickname: "",
        name: "",
        surname: "",
        email: "",
        origin: null
      },
      availableParentOrigins: []
    };
  },
  async mounted() {
    await this.init();
    await getOrigins().then(res => {
      if (res.data.origins) {
        this.availableParentOrigins = res.data.origins;
      }
    });
  },
  computed: {
    ...mapGetters({
      userInformation: AUTH_STORE_KEY + "/" + AUTH_GET_USER_INFORMATION
    })
  },

  methods: {
    init() {
      this.profileInformation = Object.assign(
        {},
        this.profileInformation,
        this.userInformation
      );
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.$store
          .dispatch(
            AUTH_STORE_KEY + "/" + AUTH_ACTION_CHANGE_PROFILE,
            this.profileInformation
          )
          .then(
            () => {
              this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                type: "success",
                msg: "Profil wurde geändert."
              });
              this.init();
            },
            () => {
              this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                type: "error",
                msg: "Profil konnte nicht geändert werden."
              });
            }
          );
      }
    }
  }
};
</script>
