<template>
  <el-cascader
    :value="value"
    expand-trigger="hover"
    :options="options"
    @change="handleChange"
  >
  </el-cascader>
</template>

<script>
import address from './place'

export default {
  props: {
    hasArea: Boolean,
    value: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    options() {
      if (!address || !address.length) return []
      return address.map(item => {
        const obj = { ...item }
        obj.value = obj.name
        obj.label = obj.name
        obj.children = obj.city.map(item => {
          item.value = item.name
          item.label = item.name
          return item
        })
        if (this.hasArea) {
          obj.children.forEach((item, index) => {
            const arr = item.area.map(item => ({ value: item, label: item }))
            obj.children[index].children = arr
          })
        }
        return obj
      })
    }
  },
  mounted() {
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
    }
  }
}
</script>
