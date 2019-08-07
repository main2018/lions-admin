<template>
  <activity-detail :is-edit="false" />
</template>

<script>
import ActivityDetail from './components/ActivityDetail'

export default {
  name: 'CreateNotice',
  components: { ActivityDetail }
}
</script>

