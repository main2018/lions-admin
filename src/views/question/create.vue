<template>
  <question-detail :is-edit="false" />
</template>

<script>
import QuestionDetail from './components/QuestionDetail'

export default {
  name: 'CreateQuestion',
  components: { QuestionDetail }
}
</script>

