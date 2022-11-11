<template>
  <article-detail :is-edit="true"/>
</template>

<script>
import ArticleDetail from './components/ArticleDetail.vue'

import { getDetail } from '@/api/table'
export default {
  name: 'EditArticle',
  components: {
    ArticleDetail
  },
  beforeRouteEnter (to, from, next) {
    (async function() {
      let b = await getDetail(to.params.id)
      to.meta.title = b.data.author
      next()
    }())
  }
}
</script>


