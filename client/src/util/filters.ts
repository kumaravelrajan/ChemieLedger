import Vue from "vue";
import moment from "moment";

moment.locale('de')

Vue.filter("formatDateTime", function(value: moment.MomentInput) {
  return moment(value).format("DD.MM.YYYY");
});

Vue.filter("formatDateTimeWithHours", function(value: moment.MomentInput) {
  return moment(value).format('LT') + ", " + moment(value).format('ll')
});
