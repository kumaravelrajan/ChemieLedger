<template>
  <v-card height="350" width="310" class="ma-4" :to="btnPath">
    <v-img :src="imgSrc" height="240" width="310"></v-img>  
    <v-card-title>{{headline.length > 29?headline.substring(0,26)+'...':headline}}</v-card-title>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text :to="btnPath">Zum Beitrag</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  name: "ArticleCard",
  props: {
    imgSrc: {
      type: String,
      required: true
    },
    headline: {
      type: String,
      required: true
    },
    btnPath: {
      type: String,
      required: true
    }
  }
};
</script>