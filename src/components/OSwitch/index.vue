<template>
  <div class="box" :class="{greenbox: checked,greybox: !checked,}" @click="switchStatus">
    <span class="green" :class="{hidden: !checked}">已发</span>
    <span class="grey" :class="{hidden: checked}">未发</span>
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      default: ''
    }
  },
  computed: {
    checked: {
      get() {
        return this.status === 'published'
      }
    }
  },
  methods: {
    switchStatus() {
      const val = this.status === 'published' ? 'draft' : 'published'
      this.$emit('handleswitch', val)
    }
  }
}
</script>

<style scoped>
.green,.grey{
  color: #fff;
  border-bottom-left-radius: 3px;
  border-top-left-radius: 3px;
  text-align: center;
  z-index: 1;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  display: inline-block;
  height: 100%;
  padding: 2px 7px;
  font-size: 12px;
  line-height: 20px;
}
.green{ background: #5cb85c;float: left;}
.grey{ background: #DCDFE6;float: right;}
.hidden{display: none;}
.box{overflow: hidden;display: inline-block;min-width: 76px;border-radius: 2px; cursor: pointer;}
.greenbox{border:1px solid #5cb85c;}
.greybox{border:1px solid #DCDFE6;}
</style>
