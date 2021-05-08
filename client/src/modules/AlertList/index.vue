<template>
  <div v-if="renderAllerts">
    <Alert
      v-for="(alert, index) in alerts"
      :key="alert._id"
      :alert-type="alert.type"
      :alert-message="alert.msg"
      :alert-id="index"
    />
  </div>
</template>
<script>
import { STORE_KEY, GETTER_ALERT } from "@/store/modules/ALERT/constants";
import { mapGetters } from "vuex";
import Alert from "./_components/Alert";

export default {
  name: "AlertList",
  components: {
    Alert
  },
  computed: {
    ...mapGetters({
      alerts: STORE_KEY + "/" + GETTER_ALERT
    }),
    renderAllerts() {
      return this.alerts && this.alerts.length > 0;
    }
  }
};
</script>
