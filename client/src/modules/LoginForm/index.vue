<template>
  <v-form @submit.prevent="submit" v-model="valid" ref="form">
    <v-card class="elevation-12">
      <v-toolbar dark color="primary">
        <v-toolbar-title>Login</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <v-text-field
          v-model="loginData.email"
          prepend-icon="person"
          name="email"
          label="E-Mail"
          type="text"
          :rules="validationRules.fieldEmail"
          required
        ></v-text-field>
        <v-text-field
          v-model="loginData.password"
          prepend-icon="lock"
          name="password"
          label="Passwort"
          type="password"
          :rules="validationRules.fieldRequired"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <router-link class="pl-3" to="request_password"
          >Passwort vergessen</router-link
        >
        <v-spacer></v-spacer>
        <v-btn type="submit" color="primary">Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
<script>
import { fieldRequired, fieldEmail } from "@/util/form-validation";
import {
  STORE_KEY as AUTH_STORE_KEY,
  ACTION_LOGIN,
} from "@/store/modules/AUTHENTICATION/constants";

export default {
  name: "LoginForm",
  data() {
    return {
      valid: false,
      loginData: {
        email: "",
        password: "",
      },
      validationRules: {
        fieldRequired: fieldRequired,
        fieldEmail: fieldEmail,
      },
    };
  },
  methods: {
    async submit() {
      if (this.$refs.form.validate()) {
        await this.$store
          .dispatch(AUTH_STORE_KEY + "/" + ACTION_LOGIN, this.loginData)
          .then(
            () => {
              this.$router.push({ path: "/explorer" });
            },
            () => {}
          );
      }
    },
  },
};
</script>
