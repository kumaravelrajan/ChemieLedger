<template>
  <v-container fluid ma-0 pa-0>
    <v-row class="display-1 mt-10 mr-10 ml-10"
      >Anwendungsbeispiele zu nachwachsenden Roh- und Reststoffen</v-row
    >
    <v-row class="mr-10 ml-10">
      <v-divider></v-divider>
    </v-row>
    <ArticleItemGroup articleType="example" />
  </v-container>
</template>
<script>
import { ArticleItemGroup } from "@/modules";

export default {
  name: "Example",
  components: {
    ArticleItemGroup
  }
};
</script>
