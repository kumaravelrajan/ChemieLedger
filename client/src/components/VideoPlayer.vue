<template>
    <video id="videoPlayer" controls autoplay muted loop>  
      <source :src="baseURL + '/video/' + videoName" type="video/mp4">
    </video>
</template> 

<script>
export default {
  name: 'VideoPlayer',
  props: {
    videoName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      baseURL : process.env.VUE_APP_BASE_API
    }
  }
}
</script>