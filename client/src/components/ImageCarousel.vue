<template>
  <v-carousel
    :show-arrows="showArrows"
    :hide-delimiters="hideDelemiters"
    :hide-delimiter-background="false"
    :cycle="cycle"
    :interval="10000"
  >
    <v-carousel-item v-for="(image,i) in images" :key="i" :src="image">
      <v-container fill-height fluid pa-0 ma-0 pb-8>
        <v-layout fill-height align-end pb-4 mb-4>
          <v-flex xs12 v-if="title || subtitle">
            <div v-if="title" class="headline white--text text-center">{{title}}</div>
            <div v-if="subtitle" class="subtitle-1 white--text text-center">{{subtitle}}</div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-carousel-item>
  </v-carousel>
</template>
<script>
export default {
  name: "ImageCarousel",
  props: {
    images: { type: Array, required: true },
    showArrows: { type: Boolean, required: true },
    hideDelemiters: { type: Boolean, required: true },
    cycle: { type: Boolean, required: true },
    title: { type: String, required: false },
    subtitle: { type: String, required: false }
  }
};
</script>