<template>
  <v-list-item :to="item.path">
    <v-list-item-action v-if="item.meta.icon">
      <v-icon>{{ item.meta.icon }}</v-icon>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>{{ item.meta.title }}</v-list-item-title>
    </v-list-item-content>
    <v-list-item-icon v-if="isNotification">
      <v-icon :color="item.active ? 'grey' : 'orange'">add_alert</v-icon>
    </v-list-item-icon>
  </v-list-item>
</template>
<script>
import { checkNotification } from "../../_api";

export default {
  name: "NavItem",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isNotificationAvailable: false,
      isNotification: false,
      timer: ""
    };
  },
  created() {
    if (
      this.item.meta.notificationtype != undefined &&
      this.item.meta.notificationtype != ""
    ) {
      this.isNotificationAvailable = true;
      this.timer = setInterval(this.checkNotification, 30000);
    }
  },
  methods: {
    checkNotification() {
      checkNotification(this.item.meta.notificationtype).then(res => {
        this.isNotification = res.data.notification;
      });
    }
  },
  beforeDestroy() {
    if (this.isNotificationAvailable) {
      clearInterval(this.timer);
    }
  }
};
</script>
