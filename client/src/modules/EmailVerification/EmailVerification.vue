<template>
  <div class="d-flex justify-center align-center" style="height:100%" >
    <v-progress-circular color="primary" :indeterminate="loading"/>
  </div>
</template>
<script>
import {
  STORE_KEY as AUTH_STORE_KEY,
  ACTION_VERIFY_EMAIL
} from "@/store/modules/AUTHENTICATION/constants";
import {
  STORE_KEY as ALERT_STORE_KEY,
  MUTATION_ADD_ALERT as ADD_ALERT
} from "@/store/modules/ALERT/constants";

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
      loading: true
    }
  },
  async mounted() {
    this.loading = true
    await this.$store
          .dispatch(AUTH_STORE_KEY + "/" + ACTION_VERIFY_EMAIL, this.token)
          .then(
            () => {
              this.loading = false
              this.$router.push({ path: "/explorer" });
              this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
                  type: "success",
                  msg: "Ihre Email-Adresse wurde erfolgreich verifiziert."
                });
            }
          )
          .catch(() => {
            this.$router.push({ path: "/login" });
            this.$store.commit(ALERT_STORE_KEY + "/" + ADD_ALERT, {
              type: "warning",
              msg: "Ihre Verfikationsemail ist bereits abgelaufen. Bitte melden Sie sich an und \
                    fordern Sie eine neue Email an."
            });
          });
  }
}
</script>

<style scoped></style>
