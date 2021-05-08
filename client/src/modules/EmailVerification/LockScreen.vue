<template>
  <v-form ref="form">
    <v-card class="elevation-12">
      <v-card-title> Bitte verifizieren Sie Ihren Account </v-card-title>
      <v-card-text>
        Sie haben eine Email erhalten, mit der Sie Ihren Account verifizieren können. 
        Sollten Sie keine Email erhalten haben, können Sie hier eine neue Email anfordern. 
      </v-card-text>
      <v-card-actions style="justify-content:center">
        <v-btn color="primary" @click="sendNewEmail()">Erneut senden</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";
import {
  STORE_KEY,
  GETTER_USER_INFORMATION,
  ACTION_INITIALIZE_USER
} from "@/store/modules/AUTHENTICATION/constants";
import { sendNewVerificationEmail } from "@/api/auth";

export default {
  name: "LockScreen",
  data() {
    return {
      timer: ""
    };
  },
  created() {
    this.timer = setInterval(this.checkIsVerified, 5000);
  },
  computed: {
    ...mapGetters({
      getUser: STORE_KEY + "/" + GETTER_USER_INFORMATION
    })
  },
  methods: {
    ...mapActions({
      setUser: STORE_KEY + "/" + ACTION_INITIALIZE_USER
    }),
    sendNewEmail() {
      sendNewVerificationEmail()
        .then(
          res => {
            if(res.data.success){
              this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                type: "success",
                msg: "Ihre Email wurde gesendet."
              });
            }
          }
        )
    },
    checkIsVerified() {
      if(localStorage.getItem('isVerified')) {
        clearInterval(this.timer);
        const user = this.getUser;
        user.isVerified = true;
        this.setUser(user);
        localStorage.removeItem('isVerified');
        this.$router.push({ path: "/explorer" });
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
  }
};
</script>
