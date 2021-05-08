<template>
  <OwnRequestOverviewList :isClosed="true" />
</template>
<script>
import OwnRequestOverviewList from "../../modules/Explorer/OwnRequestOverviewList";

export default {
  name: "OwnRequestArchiveView",
  components: {
    OwnRequestOverviewList
  }
};
</script>