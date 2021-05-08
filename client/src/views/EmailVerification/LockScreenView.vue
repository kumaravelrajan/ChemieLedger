<template>
  <v-container container--fluid>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4 lg4 xl3>
        <LockScreen />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import LockScreen from "@/modules/EmailVerification/LockScreen";

export default {
  name: "LockScreenView",
  components: {
    LockScreen
  }
};
</script>