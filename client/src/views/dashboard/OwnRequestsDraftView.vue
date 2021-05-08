<template>
  <OwnRequestOverviewList :isDraft="true" />
</template>
<script>
import OwnRequestOverviewList from "../../modules/Explorer/OwnRequestOverviewList";

export default {
  name: "OwnRequestsDraftView",
  components: {
    OwnRequestOverviewList
  }
};
</script>