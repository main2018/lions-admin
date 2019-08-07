<template>
  <el-dropdown :show-timeout="100" trigger="click">
    <el-button plain>
      {{ text }}
      <i class="el-icon-caret-bottom el-icon--right" />
    </el-button>
    <el-dropdown-menu slot="dropdown" class="no-padding">
      <el-dropdown-item>
        <el-radio-group v-model="comment_disabled" style="padding: 10px;">
          <el-radio v-for="item in list" :key="item.id" :label="item.id">
            {{ item.name }}
          </el-radio>
        </el-radio-group>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  props: {
    placeholder: {
      type: String,
      default: '请选择'
    },
    list: {
      type: [Array, Object],
      default: null
    },
    value: {
      type: [String, Number],
      default: ''
    }
  },
  computed: {
    text() {
      const list = this.list || []
      const item = list.find(item => item.id === this.value)
      return item && item.name || this.placeholder
    },
    comment_disabled: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  }
}
</script>
