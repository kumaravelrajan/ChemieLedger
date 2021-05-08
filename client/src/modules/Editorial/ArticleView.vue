<template>
  <v-container fluid pa-0 v-if="!loading">
    <ImageCarousel
      v-if="article.coverImagePath"
      :images="[getFullImagePath(article.coverImagePath)]"
      :hideDelemiters="true"
      :cycle="false"
      :showArrows="false"
    />

    <v-row v-if="article.headline" class="display-1 mt-10 mr-10 ml-10">{{article.headline}}</v-row>
    <v-row v-if="article.authorName" class="subtitle-1 mt-5 mr-10 ml-10">{{article.authorName}}</v-row>
    <v-row
      v-if="article.readingTime"
      class="subtitle-1 mr-10 ml-10"
    >Lesedauer {{article.readingTime}} Minuten</v-row>
    <v-row class="mr-10 ml-10">
      <v-divider></v-divider>
    </v-row>
    <template v-for="paragraph in article.paragraphs">
      <v-row
        v-if="paragraph.headline"
        :key="paragraph._id"
        class="headline mt-4 mr-10 ml-10"
      >{{paragraph.headline}}</v-row>
      <v-row class="mt-4 mr-10 ml-10" :key="paragraph._id+'1'">
        <v-col :order="paragraph.imageType=='right'?1:2" class="pa-0">{{paragraph.text}}</v-col>
        <v-col align="center"
          v-if="paragraph.imagePath && paragraph.imageType != 'none'"
          :order="paragraph.imageType=='right'?2:1"
          class="pa-0"
          :class="{'mt-4': ($vuetify.breakpoint.xs && paragraph.imageType=='right')}"
        >
          <v-img max-width="500" :src="getFullImagePath(paragraph.imagePath)"></v-img>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>
<script>
import { getPublicArticle, getImageURL } from "./_api";
import ImageCarousel from "@/components/ImageCarousel";

export default {
  name: "ArticleView",
  props: {
    articleId: {
      type: String,
      required: true
    }
  },
  components: {
    ImageCarousel
  },
  data() {
    return {
      loading: true,
      article: {
        _id: "1",
        articleType: "",
        authorName: "",
        headline: "",
        isPublic: true,
        paragraphs: {
          _id: "1",
          headline: "",
          imageType: "",
          order: 0,
          text: ""
        },
        readingTime: 5
      }
    };
  },
  mounted() {
    getPublicArticle(this.articleId)
      .then(res => {
        if (res.data.article) {
          this.article = Object.assign({}, res.data.article);
        }
      })
      .then(() => {
        //shouldnt happen
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    getFullImagePath(relativePath) {
      return getImageURL(relativePath);
    }
  }
};
</script>