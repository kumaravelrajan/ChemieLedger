<script>
import {
  STORE_KEY as AUTH_STORE_KEY,
  ACTION_LOGOUT
} from "@/store/modules/AUTHENTICATION/constants";

export default {
  name: "LogoutRedirect",
  created() {
    this.$store.dispatch(AUTH_STORE_KEY + "/" + ACTION_LOGOUT);
    this.$router.push("/");
  },
  render: function(h) {
    return h(); //TODO: show loading insted with a timer delay (1 sec) showing spinner
  }
};
</script>