<template>
  <ArticleView :articleId="id" />
</template>
<script>
import { ArticleView } from "@/modules";
export default {
  name: "Article",
  components: {
    ArticleView
  },
  props: ["id"]
};
</script>