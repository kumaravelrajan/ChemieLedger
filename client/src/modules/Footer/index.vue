<template>
  <v-footer
    height="auto"
    app
    inset
    :absolute="$vuetify.breakpoint.xsOnly"
    color="primary lighten-1"
    
  >
    <v-card
          flat
          tile
          width="100%"
          class="primary lighten-1 text-center"
        >
          <v-card-text
            style="padding:0px">
              <v-btn
                v-for="(link, id) in footerLinks"
                :key="id"
                :to="link.path"
                tag="v-btn"
                color="white"
                text
                rounded
                >{{ link.name }}</v-btn
              > 
          </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
export default {
  name: "Footer",
  data: () => ({
    footerLinks: [
      { name: "Über uns", path: "/about" },
      { name: "Kontakt", path: "/contact" },
      { name: "Anwendungsbeispiele", path: "/example" },
      { name: "Impressum", path: "/imprint" },
      { name: "Datenschutz", path: "/privacy" }
    ]
  })
};
</script>
