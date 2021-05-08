<template>
  <v-list-item-title>
    {{ nickname }}
  </v-list-item-title>
</template>
<script>
import { getNicknameFromUserId } from "../_api";

export default {
  name: "NicknameTitle",
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      nickname: "Anonymer Nutzer"
    };
  },
  mounted() {
    getNicknameFromUserId(this.userId).then(res => {
      if (res.data.nickname) {
        this.nickname = res.data.nickname;
      }
    });
  }
};
</script>
