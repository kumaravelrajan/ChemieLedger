<template>
  <v-sheet class="mx-auto transparent" max-width="1224">
    <v-slide-group
      v-if="articleInformation.length > 0"
      justify="center"
      class="mb-2 mt-10"
      show-arrows
    >
      <v-slide-item v-for="article in articleInformation" :key="article._id">
        <ArticleCard
          :imgSrc="
            article.coverImagePath
              ? receiveImagePath(article.coverImagePath)
              : require('@/assets/images/orionthemes-placeholder-image.png')
          "
          :headline="article.headline"
          :btnPath="'/article/' + article._id"
        />
      </v-slide-item>
    </v-slide-group>
    <v-row justify="center" class="mb-2 mt-10" v-else>
      <div align="center" justify="center" class="display-1">
        Keine
        {{
        this.articleType == "example" ? "Anwendungsbeispiele" : "Nachrichten"
        }}
        vorhanden.
      </div>
    </v-row>
  </v-sheet>
</template>
<script>
import { getArticleMinInformation, getImageURL } from "./_api";
import ArticleCard from "./_components/ArticleCard";

export default {
  name: "ArticleSlider",
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
