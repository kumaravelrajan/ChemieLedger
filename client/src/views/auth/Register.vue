<template>
  <v-container container--fluid>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md6 lg6 xl4>
        <RegisterForm />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { RegisterForm } from "@/modules";

export default {
  name: "Register",
  components: {
    RegisterForm
  }
};
</script>