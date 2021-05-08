<template>
  <v-container container--fluid>
    <v-layout align-center justify-center>
      <v-flex>
        <EmailVerification :token="token" />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import EmailVerification from "@/modules/EmailVerification/EmailVerification";

export default {
  name: "EmailVerificationView",
  components: {
    EmailVerification
  },
  props:["token"]
};
</script>