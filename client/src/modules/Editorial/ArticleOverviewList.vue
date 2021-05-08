<template>
  <v-container>
    <ArticleList articleType="example" generalHeadline="Anwendungsbeispiele" />
    <ArticleList articleType="news" generalHeadline="News" />
  </v-container>
</template>
<script>
import ArticleList from "./_components/ArticleList";

export default {
  name: "ArticleOverviewList",
  components: {
    ArticleList
  }
};
</script>