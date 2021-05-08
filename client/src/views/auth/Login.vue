<template>
  <v-container container--fluid>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4 lg4 xl3>
        <LoginForm />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { LoginForm } from "@/modules";

export default {
  name: "Login",
  components: {
    LoginForm
  }
};
</script>