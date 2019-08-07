<template>
  <activity-detail :is-edit="true" />
</template>

<script>
import ActivityDetail from './components/ActivityDetail'

export default {
  name: 'EditArticle',
  components: { ActivityDetail }
}
</script>

