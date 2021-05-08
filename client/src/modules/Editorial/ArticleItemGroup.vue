<template>
  <v-container v-if="articleInformation.length > 0" fluid>
    <v-row justify="start">
      <v-col v-for="article in articleInformation" :key="article._id" sm=6 md=4 xl=3 style="justify-content: center; display: flex">
        <ArticleCard
          :imgSrc="article.coverImagePath?receiveImagePath(article.coverImagePath):require('@/assets/images/orionthemes-placeholder-image.png')"
          :headline="article.headline"
          :btnPath="'/article/'+article._id"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { getArticleMinInformation, getImageURL } from "./_api";
import ArticleCard from "./_components/ArticleCard";
export default {
  name: "ArticleItemGroup",
  components: {
    ArticleCard
  },
  props: {
    articleType: {
      validator: function(val) {
        return ["example", "news"].indexOf(val) !== -1;
      }
    }
  },
  data() {
    return {
      articleInformation: []
    };
  },
  mounted() {
    getArticleMinInformation(this.articleType).then(res => {
      if (res.data.articles) {
        this.articleInformation = res.data.articles;
      }
    });
  },
  methods: {
    receiveImagePath(relativePath) {
      return getImageURL(relativePath);
    }
  }
};
</script>