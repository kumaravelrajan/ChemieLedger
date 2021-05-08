<template>
  <v-alert
    :type="alertType"
    :value="true"
    @input="changeValue"
    dismissible
    :style="{'top': $vuetify.application.top +'px',
             'width': (windowWidth-$vuetify.application.left)*0.98+'px',
             'margin': (windowWidth-$vuetify.application.left)*0.01+'px',
             'left': $vuetify.application.left+'px'}"
  >{{alertMessage}}</v-alert>
</template>

<script>
import { mapMutations } from "vuex";
import {
  STORE_KEY,
  MUTATION_DELETE_ALERT
} from "@/store/modules/ALERT/constants";
export default {
  name: "Alert",
  props: {
    alertType: {
      type: String,
      required: true,
      validator: function(value) {
        return ["error", "warning", "info", "success"].indexOf(value) !== -1;
      }
    },
    alertMessage: {
      type: String,
      required: true
    },
    alertId: {
      type: Number,
      required: true
    }
  },
  computed: {
    windowWidth () {
      return window.innerWidth;
    }
  },
  methods: {
    ...mapMutations({
      deleteAlert: STORE_KEY + "/" + MUTATION_DELETE_ALERT
    }),
    changeValue() {
      this.deleteAlert(this.$props.alertId);
    }
  }
};
</script>
