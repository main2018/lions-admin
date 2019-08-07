<template>
  <div id="map">
    <iframe
      id="test"
      style="width:100%;border: 1px solid #eee"
      height="500"
      frameborder="0"
      seamless="seamless"
      :src="`https://m.amap.com/picker/?keywords=商场,小区,学校&amp;zoom=15&amp;center=${value.location || ''}&amp;radius=10000&amp;total=20&amp;key=8b2cd8ed6dae8e08db000196d75f2d4e`"
    >
    </iframe>
    <div class="result">已选地址：{{ value.name ? `(${value.name})` : '' }}{{ value.address }}</div>
  </div>
</template>

<script type='text/ecmascript-6'>
/* eslint-disable */
const key = 'a78fd75766bdec87627a2a9170a90c26'
const key_web = '8b2cd8ed6dae8e08db000196d75f2d4e'

export default {
  props: {
    value: {
      type: Object,
      default: {}
    }
  },
  computed: {
  },
  mounted() {
    this.init()
    console.log('value', this.value)
  },
  methods: {
    init() {
      var iframe = document.getElementById('test').contentWindow
      document.getElementById('test').onload = function(){
        iframe.postMessage('hello', 'https://m.amap.com/picker/')
      };
      window.addEventListener("message", (e) => {
        console.log('e.data', e.data)
        if (e.data && e.data.address) this.$emit('input', e.data)
      }, false)
    }
  }
}
</script>

<style lang="scss" scoped>
#map{
  position: relative;
  .result{
    position: absolute;
    bottom: 0;
    right: 25px;
    z-index: 99999;
    font-size: 10px;
    color: green;
  }
}
</style>
