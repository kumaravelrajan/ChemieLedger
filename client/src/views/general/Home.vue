<template>
  <v-container fluid ma-0 pa-0>
    <ImageCarousel
      :images="carouselImages"
      :hideDelemiters="false"
      :cycle="true"
      :showArrows="false"
      title="Wir vernetzen Abnehmer und Erzeuger von nachwachsenden Roh- und Reststoffen."
      subtitle="Kostenlos, Einfach, Regional"
    />

    <v-row v-if="!isLoggedIn" justify="center">
      <v-btn to="/login" color="primary" width="160px" class="ma-5"
        >Anmelden</v-btn
      >
      <v-btn to="/register" color="primary" width="160px" class="ma-5"
        >Registrieren</v-btn
      >
    </v-row>

    <v-row justify="center" class="mb-2 mt-10">
      <div align="center" justify="center" class="headline">
        Was leistet die Rohstoffbörse?
      </div>
    </v-row>

    <v-row justify="center">
      <VideoPlayer videoName="rb_movie" :width="isMobile ? '100%' : '50%'" />
    </v-row>

    <v-container>
      <v-row
        justify="center"
        v-for="(descriptionStep, i) in descriptionSteps"
        :key="i"
      >
        <div class="flex-grow-1"></div>
        <v-col
          v-if="descriptionStep.direction === 'left'"
          cols="12"
          md="4"
          lg="3"
          xl="2"
          xs="6"
          sm="6"
          align="right"
        >
          <v-card class="pa-2" max-width="360">
            <v-img max-height="150" :src="descriptionStep.img"></v-img>
          </v-card>
        </v-col>
        <v-col
          v-else
          cols="12"
          xs="6"
          sm="6"
          md="4"
          lg="3"
          xl="2"
          max-width="360"
          align="right"
        >
          <div class="pa-2" max-width="360">
            <div class="title">{{ descriptionStep.title }}</div>
            {{ descriptionStep.description }}
          </div>
        </v-col>

        <v-col
          v-if="descriptionStep.direction === 'left'"
          cols="12"
          md="4"
          lg="3"
          xl="2"
          xs="6"
          sm="6"
          max-width="360"
          align="left"
        >
          <div class="pa-2" max-width="360">
            <div class="title">{{ descriptionStep.title }}</div>
            {{ descriptionStep.description }}
          </div>
        </v-col>
        <v-col v-else cols="12" xs="6" sm="6" md="4" lg="3" xl="2" align="left">
          <v-card class="pa-2" max-width="360">
            <v-img max-height="150" :src="descriptionStep.img"></v-img>
          </v-card>
        </v-col>
        <div class="flex-grow-1"></div>
      </v-row>
    </v-container>

    <v-row justify="center" class="mb-2 mt-10">
      <div align="center" justify="center" class="headline">
        Anwendungsbeispiele zu nachwachsenden Roh- und Reststoffen
      </div>
    </v-row>

    <ArticleSlider articleType="example" />

    <!--
    <v-row justify="center" class="mb-2 mt-10">
      <div align="center" justify="center" class="display-1">
        Neuigkeiten und Ankündigungen zum Projekt
      </div>
    </v-row>
    <ArticleSlider articleType="news" />
  -->
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";
import {
  STORE_KEY as AUTH_STORE_KEY,
  GETTER_USER_TOKEN as AUTH_GETTER_USER_TOKEN,
} from "@/store/modules/AUTHENTICATION/constants";
import ImageCarousel from "@/components/ImageCarousel";
import VideoPlayer from "@/components/VideoPlayer";
import { ArticleSlider } from "@/modules";

export default {
  name: "Home",
  components: {
    ImageCarousel,
    ArticleSlider,
    VideoPlayer,
  },
  data() {
    return {
      carouselImages: [
        require("@/assets/images/homecarousel/erik-witsoe-726291-unsplash.jpg"),
        require("@/assets/images/homecarousel/jakob-creutz-348062-unsplash.jpg"),
        require("@/assets/images/homecarousel/stella-de-smit-977313-unsplash.jpg"),
      ],
      descriptionSteps: [
        {
          direction: "left",
          img: require("@/assets/images/homedescription/benefit_insert.svg"),
          title: "Anbieten",
          description:
            "Inserieren Sie kostenlos Ihre nachwachsenden Roh- und Reststoffe in den verfügbaren Mengen...",
        },
        {
          direction: "right",
          img: require("@/assets/images/homedescription/magnifying_glass.svg"),
          title: "Suchen und Finden",
          description:
            "Sehen Sie hier verfügbare nachwachsende Roh- und Reststoffe nach Art, Menge und Region...",
        },
        {
          direction: "left",
          img: require("@/assets/images/homedescription/routing.svg"),
          title: "Service",
          description:
            "Kosten vergleichen, Kontakte knüpfen, PLZ-Suche (folgt) und weitere Services...",
        },
        {
          direction: "right",
          img: require("@/assets/images/homedescription/use-cases.svg"),
          title: "Information",
          description:
            "Was bietet die digitale Rohstoffbörse für nachhaltige Rohstoffe und wie können Sie davon in Ihrem Business profitieren?",
        },
      ],
    };
  },
  computed: {
    ...mapGetters({
      authKey: AUTH_STORE_KEY + "/" + AUTH_GETTER_USER_TOKEN,
    }),
    isLoggedIn() {
      return this.authKey !== null;
    },
    isMobile() {
      return this.$vuetify.breakpoint.xs;
    },
  },
};
</script>
<style scoped>
.transparent {
  background-color: transparent !important;
  border-color: transparent !important;
}
</style>
