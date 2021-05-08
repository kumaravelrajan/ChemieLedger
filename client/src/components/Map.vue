<template>
  <v-card class="elevation-1 pa-4 ma-4">
    <v-card-text class="text-center">
      <v-progress-circular
        align-center
        v-show="!ready || loading"
        indeterminate
        color="primary"
        size="120"
        width="4"
      />

      <l-map
        v-show="!loading && ready"
        ref="myMap"
        :style="{ height: (windowHeight * 2.5) / 4 + 'px' }"
        :zoom="zoom"
        :min-zoom="5"
        :max-zoom="8"
        :center="center"
        :options="{ zoomControl: false }"
        :key="refreshKey"
      >
        <l-tile-layer
          :url="url"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        >
        </l-tile-layer>

        <l-marker
          v-for="marker in markers"
          :lat-lng="marker.latLng"
          :key="marker.plz"
        >
          <l-icon
            width="0px"
            :icon-size="[0, 0]"
            :icon-anchor="[markerWidth / 2, markerWidth]"
          >
            <span
              :style="{
                width: markerWidth + 'px',
                top: markerWidth / 8 + 'px',
              }"
            >
              {{ marker.count }}
            </span>
            <img :width="markerWidth + 'px'" :src="img" />
          </l-icon>
        </l-marker>

        <l-control-zoom position="topright"></l-control-zoom>
        <l-geo-json :geojson="geojson" :options="options"></l-geo-json>
      </l-map>
    </v-card-text>
  </v-card>
</template>

<script>
import "leaflet/dist/leaflet.css";
import {
  LMap,
  LTileLayer,
  LGeoJson,
  LControlZoom,
  LMarker,
  LIcon,
} from "vue2-leaflet";
import { Icon } from "leaflet";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default {
  name: "Map",
  components: {
    LMap,
    LTileLayer,
    LGeoJson,
    LControlZoom,
    LMarker,
    LIcon,
  },
  props: {
    items: {
      type: Array,
      required: true,
      default: null,
    },
    ready: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  data() {
    return {
      url: "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",
      windowHeight: window.innerHeight,
      markerWidth: 32,
      zoom: 6,
      center: [50.5, 10.6],
      geojson: null,
      itemsPerPLZ: {},
      refreshKey: 0,
      img: require("../assets/maps/Marker/marker-64.png"),
      loading: true,
      markers: [],
      options: {
        style: {
          color: "#5F6670",
          weight: 1,
          fill: false,
        },
        onEachFeature: (feature, layer) => {
          if (this.itemsPerPLZ[feature.properties.plz]) {
            var marker = {
              latLng: layer.getBounds().getCenter(),
              plz: feature.properties.plz,
              count: this.itemsPerPLZ[feature.properties.plz].count,
            };
            this.markers.push(marker);
            delete this.itemsPerPLZ[feature.properties.plz];
          }
        },
      },
    };
  },
  methods: {
    async init() {
      if (!this.geojson) {
        this.geojson = (await import("@/assets/maps/plz-2stellig.json")).default;
      }
      this.calculateItemsPerPLZ();
      this.loading = false;
    },
    calculateItemsPerPLZ() {
      this.itemsPerPLZ = {};
      for (var i = 0; i < this.items.length; i++) {
        var plzOfItem = Math.floor(this.items[i].plz / 1000);
        if (this.itemsPerPLZ[plzOfItem]) {
          this.itemsPerPLZ[plzOfItem].count++;
        } else {
          this.itemsPerPLZ[plzOfItem] = {};
          this.itemsPerPLZ[plzOfItem].count = 1;
        }
      }
      this.updateGeoJSON();
    },
    updateGeoJSON() {
      this.removeMarkers();
      this.refreshKey++;
    },
    removeMarkers() {
      for (let i = 0; i < this.markers.length; i++) {
        this.$refs.myMap.mapObject.removeLayer(this.markers[i]);
      }
      this.markers = [];
    },
  },
  watch: {
    items() {
      this.calculateItemsPerPLZ();
    },
    ready() {
      this.init();
    },
  },
};
</script>

<style scoped>
.leaflet-marker-icon span {
  position: absolute;
  font-weight: bold;
  font-size: 10px;
  z-index: 1;
  color: white;
}
.leaflet-marker-icon img {
  position: absolute;
}
</style>
