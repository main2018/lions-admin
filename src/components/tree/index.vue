<template>
  <div class="org-tree-container">
    <div class="org-tree" :class="{horizontal, collapsable}">
      <org-tree-node
        :data="data"
        :props="props"
        :horizontal="horizontal"
        :label-width="labelWidth"
        :collapsable="collapsable"
        :render-content="renderContent"
        :label-class-name="labelClassName"
        @on-expand="(e, data) => {$emit('on-expand', e, data)}"
        @on-node-click="nodeClick"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */

import render from './node'
export default {
  name: 'Vue2OrgTree',
  components: {
    OrgTreeNode: {
      render,
      functional: true
    }
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    props: {
      type: Object,
      default: () => ({
        label: 'label',
        expand: 'expand',
        children: 'children'
      })
    },
    horizontal: Boolean,
    selectedKey: String,
    collapsable: Boolean,
    renderContent: Function,
    labelWidth: [String, Number],
    labelClassName: [Function, String],
    selectedClassName: [Function, String]
  },
  methods: {
    nodeClick(e, data) {
      // const isTarget = e.target.classList.contains('org-tree-node-label-inner')
      const isTarget = e.target.classList.contains('org-tree-node-btn')
      if (!isTarget) this.$emit('on-node-click', e, data)
    }
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>
