<template>
  <EditArticle :articleId="id" />
</template>
<script>
import { EditArticle } from "@/modules";

export default {
  name: "CrudArticleView",
  components: {
    EditArticle
  },
  props: ["id"]
};
</script>