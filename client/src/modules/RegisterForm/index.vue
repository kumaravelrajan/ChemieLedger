<template>
  <v-form @submit.prevent="submit" v-model="valid" ref="form">
    <v-card class="elevation-12">
      <v-toolbar dark color="primary">
        <v-toolbar-title>Registrieren</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <v-container fluid grid-list-md>
          <v-layout row>
            <v-flex md12>
              <v-text-field
                v-model="registerData.nickname"
                name="nickname"
                label="Benutzername/Alias"
                type="text"
                :rules="validationRules.fieldRequired"
                required
              >
                <template v-slot:prepend>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon v-on="on">info</v-icon>
                    </template>
                    Dieser Name wird anderen Personen auf der Plattform
                    angezeigt.
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex md6>
              <v-text-field
                v-model="registerData.name"
                name="name"
                label="Vorname"
                type="text"
                :rules="validationRules.fieldRequired"
                required
              ></v-text-field>
            </v-flex>
            <v-flex md6>
              <v-text-field
                v-model="registerData.surname"
                name="name"
                label="Nachname"
                type="text"
                :rules="validationRules.fieldRequired"
                required
              ></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex md12>
              <v-text-field
                v-model="registerData.email"
                name="email"
                label="E-Mail"
                type="text"
                :rules="validationRules.fieldEmail"
                required
              ></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex md6>
              <v-text-field
                v-model="registerData.password"
                name="password"
                label="Passwort"
                type="password"
                :rules="validationRules.fieldPassword"
              ></v-text-field>
            </v-flex>
            <v-flex md6>
              <v-text-field
                v-model="passwordConfirm"
                name="passwordConfirm"
                label="Passwort bestätigen"
                type="password"
                :rules="emailConfirmationRule"
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn type="submit" color="primary">Registrieren</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
<script>
import {
  fieldRequired,
  fieldEmail,
  fieldPassword
} from "@/util/form-validation";
import {
  STORE_KEY as AUTH_STORE_KEY,
  ACTION_REGISTER
} from "@/store/modules/AUTHENTICATION/constants";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";

export default {
  name: "RegisterForm",
  data() {
    return {
      valid: false,
      registerData: {
        name: "",
        surname: "",
        nickname: "",
        email: "",
        password: ""
      },
      passwordConfirm: "",
      validationRules: {
        fieldRequired: fieldRequired,
        fieldEmail: fieldEmail,
        fieldPassword: fieldPassword
      }
    };
  },
  computed: {
    emailConfirmationRule() {
      return [
        v => !!v || "Dieses Feld ist erforderlich.",
        this.registerData.password === this.passwordConfirm ||
          "Passwörter müssen identisch sein."
      ];
    }
  },
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        this.$store
          .dispatch(AUTH_STORE_KEY + "/" + ACTION_REGISTER, this.registerData)
          .then(
            () => {
              this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                type: "success",
                msg: "Sie wurden erfolgreich registriert."
              });
              this.$router.push({ path: "/home" });
            },
            () => {}
          );
      }
    }
  }
};
</script>

<style scoped></style>
