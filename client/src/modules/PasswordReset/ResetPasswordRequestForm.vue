<template>
  <v-form @submit.prevent="submit" v-model="valid" ref="form">
    <v-card class="elevation-12">
      <v-toolbar dark color="primary">
        <v-toolbar-title>Neues Passwort beantragen</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <v-container fluid grid-list-md>
          <v-layout row>
            <v-flex md12>
              <v-text-field
                v-model="email"
                name="email"
                label="E-Mail"
                type="text"
                :rules="validationRules.fieldEmail"
                required
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn type="submit" color="primary">Email senden</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
<script>
import {
  fieldRequired,
  fieldEmail
} from "@/util/form-validation";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";
import { resetPasswordRequest } from "@/api/auth";

export default {
  name: "ResetPasswordRequestForm",
  data() {
    return {
      valid: false,
      email: "",
      validationRules: {
        fieldRequired: fieldRequired,
        fieldEmail: fieldEmail
      }
    };
  },
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        resetPasswordRequest({email: this.email})
          .then(
            res => {
              if(res.data.success){
                this.$router.push({ path: "/home" });
                this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                  type: "success",
                  msg: "Ihre Email wurde gesendet."
                });
              }
            }
          )
      }
    }
  }
};
</script>

<style scoped></style>
