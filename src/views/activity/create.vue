<template>
  <activity-detail :is-edit="false" />
</template>

<script>
import ActivityDetail from './components/ActivityDetail'

export default {
  name: 'CreateForm',
  components: { ActivityDetail }
}
</script>

