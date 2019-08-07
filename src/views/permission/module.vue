<template>
  <div class="app-container">
  </div>
</template>

<script>
import { getCategories } from '@/api/permission'

export default {
  name: 'ModulePermission',
  components: {},
  data() {
    return {
      modules: []
    }
  },
  methods: {
    async getCategories() {
      const modules = await getCategories()
      this.modules = modules
    }
  }
}
</script>
