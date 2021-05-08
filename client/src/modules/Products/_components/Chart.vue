<template>
  <v-card class="elevation-1 pa-4 ma-4">
    <v-card-title>
      Preishistorie
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col
          :cols="$vuetify.breakpoint.sm || $vuetify.breakpoint.xs ? 12 : 3"
          class="pt-0"
        >
          <v-overflow-btn
            :items="priceTypeOptions"
            item-text="text"
            item-value="val"
            label="Preistyp"
            v-model="priceType"
            dense
            class="ml-3"
          ></v-overflow-btn>
        </v-col>
        <v-spacer />
        <v-col
          :cols="$vuetify.breakpoint.sm || $vuetify.breakpoint.xs ? 12 : 6"
          class="pt-0"
        >
          <v-btn id="b1m" color="primary" class="mr-1 mt-3">1m</v-btn>
          <v-btn id="b3m" color="primary" class="mr-1 mt-3">3m</v-btn>
          <v-btn id="b6m" color="primary" class="mr-1 mt-3">6m</v-btn>
          <v-btn id="b1y" color="primary" class="mr-1 mt-3">1y</v-btn>
          <v-btn id="bytd" color="primary" class="mr-1 mt-3">YTD</v-btn>
          <v-btn id="bmax" color="primary" class="mt-3">MAX</v-btn>
        </v-col>
      </v-row>
      <div v-show="!loading" class="chart" ref="chartdiv"></div>
      <v-row v-if="loading">
        <v-col align="center" justify="center">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { getPricehistory } from "../_api";

export default {
  name: "Chart",
  props: {
    productId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      priceType: "close",
      priceTypeOptions: [
        { val: "close", text: "Schlusspreis" },
        { val: "ask", text: "Gesuchspreis" },
        { val: "bid", text: "Angebotspreis" },
      ],
      ask: [],
      bid: [],
      close: [],
      chart: {},
      loading: true,
    };
  },
  async mounted() {
    this.renderChart();
  },
  methods: {
    async renderChart() {
      this.loading = true;
      // this[priceType] = (JSON.parse(JSON.stringify((await getPricehistory('5db80de1aad02a2fd007106a', this.pr)).data)))["pricehistories"]
      // "2020-04-14T09:36:32.189Z"
      // this[priceType].forEach(e => e["createdAt"] = e["createdAt"].slice(0,10)+","+e["createdAt"].slice(11,16))

      //am4core.useTheme(am4themes_animated);
      var chart = am4core.create(this.$refs.chartdiv, am4charts.XYChart);

      /*
      var indicator;
      var indicatorInterval;
      function showIndicator() {
        if (!indicator) {
          indicator = chart.tooltipContainer.createChild(am4core.Container);
          indicator.background.fill = am4core.color("#fff");
          indicator.background.fillOpacity = 0.8;
          indicator.width = am4core.percent(100);
          indicator.height = am4core.percent(100);

          var indicatorLabel = indicator.createChild(am4core.Label);
          indicatorLabel.text = "Daten werden geladen";
          indicatorLabel.align = "center";
          indicatorLabel.valign = "middle";
          indicatorLabel.fontSize = 20;
          indicatorLabel.dy = 50;

          var hourglass = indicator.createChild(am4core.Image);
          hourglass.href =
            "https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-160/hourglass.svg";
          hourglass.align = "center";
          hourglass.valign = "middle";
          hourglass.horizontalCenter = "middle";
          hourglass.verticalCenter = "middle";
          hourglass.scale = 0.7;
        }

        indicator.hide(0);
        indicator.show();

        clearInterval(indicatorInterval);
        indicatorInterval = setInterval(function() {
          hourglass.animate(
            [
              {
                from: 0,
                to: 360,
                property: "rotation",
              },
            ],
            2000
          );
        }, 3000);
      }
      function hideIndicator() {
        indicator.hide();
        clearInterval(indicatorInterval);
      }
      showIndicator();
      */

      // Load the content of each pricetype just once
      if (!this[this.priceType].length) {
        await this.createPriceHistory(this.productId, this.priceType);
      }
      /*
      // Create daily series and related axes
      let dateAxis1 = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis1.renderer.grid.template.location = 0;
      dateAxis1.renderer.minGridDistance = 40;

      let valueAxis1 = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis1.title.text = "Volumen";

      let series1 = chart.series.push(new am4charts.ColumnSeries());
      series1.dataFields.valueY = "volume";
      series1.dataFields.dateX = "createdAt";
      series1.data = this[this.priceType].volume;
      series1.xAxis = dateAxis1;
      series1.yAxis = valueAxis1;
      series1.tooltipText =
        "{dateX.formatDate('dd/MM/yyyy')}: [bold]{valueY}[/]";

      let dateAxis2 = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis2.renderer.grid.template.location = 0;
      dateAxis2.renderer.minGridDistance = 40;
      dateAxis2.renderer.labels.template.disabled = true;
      dateAxis2.renderer.grid.template.disabled = true;
      dateAxis2.renderer.tooltip.disabled = true;

      let valueAxis2 = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis2.renderer.opposite = true;
      valueAxis2.title.text = "Preis";

      let series2 = chart.series.push(new am4charts.LineSeries());
      series2.dataFields.valueY = "price";
      series2.dataFields.dateX = "createdAt";
      series2.data = this[this.priceType].price;
      series2.xAxis = dateAxis2;
      series2.yAxis = valueAxis2;
      series2.strokeWidth = 3;
      series2.tooltipText =
        "{dateX.formatDate('dd/MM/yyyy hh:00')}: [bold]{valueY}[/]";

      chart.cursor = new am4charts.XYCursor();
      */

      chart.data = this[this.priceType];
      chart.leftAxesContainer.layout = "vertical";
      // chart.dateFormatter.dateFormat = "yyyy-MM-dd";
      // chart.dataDateFormat = "yyyy.MM.dd,HH:mm";
      // chart.dateFormatter.dateFormat = "yyyy.MM.dd,HH:mm";
      // chart.paddingRight = 20;

      let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;
      dateAxis.renderer.grid.template.disabled = true;
      dateAxis.keepSelection = true;
      dateAxis.groupData = true;
      dateAxis.baseInterval = {
        timeUnit: "hour",
        count: 1,
      };
      // if 8 or less days are displayed the chart starts to show per hour
      // and displays the value and time incorrectly
      dateAxis.minZoomCount = 9 * 24;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.tooltip.disabled = true;
      valueAxis.renderer.minWidth = 35;
      valueAxis.renderer.baseGrid.disabled = true;
      valueAxis.height = am4core.percent(55);

      // valueAxis.renderer.gridContainer.background.fill = am4core.color("#000000");
      // valueAxis.renderer.gridContainer.background.fillOpacity = 0.05;
      // valueAxis.renderer.inside = true;

      let series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.dateX = "createdAt";
      series.dataFields.valueY = "price";
      // series.yAxis = valueAxis;
      series.tooltipText = "Preis: {valueY.value}";
      chart.cursor = new am4charts.XYCursor();

      var valueAxis2 = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis2.tooltip.disabled = true;
      valueAxis2.height = am4core.percent(35);
      valueAxis2.zIndex = 3;
      valueAxis2.calculateTotals = true;
      valueAxis2.marginTop = 40;
      valueAxis2.renderer.baseGrid.disabled = true;
      // valueAxis2.renderer.inside = true;
      valueAxis2.renderer.labels.template.verticalCenter = "bottom";
      valueAxis2.renderer.labels.template.padding(2, 2, 2, 2);
      //valueAxis.renderer.maxLabelPosition = 0.95;
      valueAxis2.renderer.fontSize = "0.8em";

      valueAxis2.renderer.gridContainer.background.fill = am4core.color(
        "#000000"
      );
      valueAxis2.renderer.gridContainer.background.fillOpacity = 0.05;

      var series2 = chart.series.push(new am4charts.ColumnSeries());
      series2.dataFields.dateX = "createdAt";
      series2.dataFields.valueY = "volume";
      series2.yAxis = valueAxis2;
      series2.tooltipText = "Volumen: {valueY}";
      series2.groupFields.valueY = "sum";
      series2.defaultState.transitionDuration = 0;

      let scrollbarX = new am4charts.XYChartScrollbar();
      scrollbarX.series.push(series);
      scrollbarX.marginBottom = 10;
      chart.scrollbarX = scrollbarX;

      /*
      chart.events.on("ready", function() {
        hideIndicator();
      });
*/
      //----------------- zoom buttons
      document.getElementById("b1m").addEventListener("click", function() {
        var max = dateAxis.groupMax["day1"]
          ? dateAxis.groupMax["day1"]
          : dateAxis.groupMax["week1"];
        var date = new Date(max);
        am4core.time.add(date, "month", -1);
        zoomToDates(date);
      });

      document.getElementById("b3m").addEventListener("click", function() {
        var max = dateAxis.groupMax["day1"]
          ? dateAxis.groupMax["day1"]
          : dateAxis.groupMax["week1"];
        var date = new Date(max);
        am4core.time.add(date, "month", -3);
        zoomToDates(date);
      });

      document.getElementById("b6m").addEventListener("click", function() {
        var max = dateAxis.groupMax["day1"]
          ? dateAxis.groupMax["day1"]
          : dateAxis.groupMax["week1"];
        var date = new Date(max);
        am4core.time.add(date, "month", -6);
        zoomToDates(date);
      });

      document.getElementById("b1y").addEventListener("click", function() {
        var max = dateAxis.groupMax["day1"]
          ? dateAxis.groupMax["day1"]
          : dateAxis.groupMax["week1"];
        var date = new Date(max);
        am4core.time.add(date, "year", -1);
        zoomToDates(date);
      });

      document.getElementById("bytd").addEventListener("click", function() {
        var max = dateAxis.groupMax["day1"]
          ? dateAxis.groupMax["day1"]
          : dateAxis.groupMax["week1"];
        var date = new Date(max);
        am4core.time.round(date, "year", 1);
        zoomToDates(date);
      });

      document.getElementById("bmax").addEventListener("click", function() {
        var min = dateAxis.groupMin["day1"]
          ? dateAxis.groupMin["day1"]
          : dateAxis.groupMin["week1"];
        var date = new Date(min);
        zoomToDates(date);
      });

      function zoomToDates(date) {
        var min = dateAxis.groupMin["day1"]
          ? dateAxis.groupMin["day1"]
          : dateAxis.groupMin["week1"];
        var max = dateAxis.groupMax["day1"]
          ? dateAxis.groupMax["day1"]
          : dateAxis.groupMax["week1"];
        dateAxis.keepSelection = true;
        var start = (date.getTime() - min) / (max - min);
        start = start > 0 ? start : 0;
        dateAxis.zoom({ start, end: 1 });
      }
      this.chart = chart;
      this.loading = false;
    },
    disposeChart() {
      if (this.chart) {
        this.chart.data = {};
        this.chart.dispose();
      }
    },
    async createPriceHistory(id, type) {
      await getPricehistory(id, type).then((res) => {
        if (res.data.pricehistories) {
          var priceList = [];
          var lastDate = null;
          var listIterator = 0;
          for (var i = 0; i < res.data.pricehistories.length; i++) {
            var tempDate = new Date(res.data.pricehistories[i].createdAt);
            var newPriceEntry = res.data.pricehistories[i];

            if (priceList.length < 1) {
              lastDate = tempDate;
              lastDate.setHours(12, 0, 0);
              newPriceEntry.createdAt = lastDate;
              priceList.push(newPriceEntry);
              listIterator++;
            } else {
              if (lastDate.getDate() == tempDate.getDate()) {
                priceList[listIterator - 1].volume =
                  priceList[listIterator - 1].volume + newPriceEntry.volume;
                priceList[listIterator - 1].price = newPriceEntry.price;
              } else {
                lastDate = tempDate;
                lastDate.setHours(12, 0, 0);
                newPriceEntry = Object.assign({}, newPriceEntry, {
                  createdAt: lastDate,
                });
                priceList.push(newPriceEntry);
                listIterator++;
              }
            }
          }
          this[type] = JSON.parse(JSON.stringify(priceList));
        }
      });
    },
  },
  beforeDestroy() {
    this.disposeChart();
  },
  watch: {
    priceType() {
      this.loading = true;
      this.disposeChart();
      this.renderChart();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.chart {
  width: 90%;
  height: 350px;
}
</style>
