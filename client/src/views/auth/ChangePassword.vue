<template>
  <v-container container--fluid>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4 lg4 xl3>
        <ChangePasswordForm :token="token" />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import ChangePasswordForm from "@/modules/PasswordReset/ChangePasswordForm";

export default {
  name: "ChangePassword",
  components: {
    ChangePasswordForm
  },
  props:["token"]
};
</script>