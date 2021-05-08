<template>
  <v-container container--fluid>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4 lg4 xl3>
        <ResetPasswordRequestForm />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import ResetPasswordRequestForm from "@/modules/PasswordReset/ResetPasswordRequestForm";

export default {
  name: "ResetPasswordRequest",
  components: {
    ResetPasswordRequestForm
  }
};
</script>