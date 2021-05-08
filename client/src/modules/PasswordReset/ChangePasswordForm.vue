<template>
  <v-form @submit.prevent="submit" v-model="valid" ref="form">
    <v-card class="elevation-12">
      <v-toolbar dark color="primary">
        <v-toolbar-title>Passwort zurücksetzen</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <v-container fluid grid-list-md>
          
          <v-layout row wrap>
            <v-flex md6>
              <v-text-field
                v-model="password"
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
        <v-btn type="submit" color="primary">Passwort zurücksetzen</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
<script>
import {
  fieldRequired,
  fieldPassword
} from "@/util/form-validation";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";
import { resetPassword } from "@/api/auth"

export default {
  name: "ChangePasswordForm",
  props: {
    token: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      valid: false,
      password: "",      
      passwordConfirm: "",
      validationRules: {
        fieldRequired: fieldRequired,
        fieldPassword: fieldPassword
      }
    };
  },
  computed: {
    emailConfirmationRule() {
      return [
        v => !!v || "Dieses Feld ist erforderlich.",
        this.password === this.passwordConfirm ||
          "Passwörter müssen identisch sein."
      ];
    }
  },
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        resetPassword({password: this.password}, this.token)
          .then(
            res => {
              if(res.data.success){
                this.$router.push({ path: "/login" });
                this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                  type: "success",
                  msg: "Ihr Passwort wurde geändert. Sie können sich jetzt anmelden."
                });
              } else {
                this.$router.push({ path: "/request_password" });
                this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                  type: "warning",
                  msg: "Es ist ein Fehler aufgetreten. \
                        Forden Sie bitte erneut eine Email an."
                });
              }
            }
          )
          .catch(() => {
            this.$router.push({ path: "/request_password" });
            this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
              type: "warning",
              msg: "Die Anfrage der Zurücksetzung des Passworts ist bereits abgelaufen. \
                    Forden Sie bitte erneut eine Email an."
            });
          });
      }
    }
  }
};
</script>

<style scoped></style>
