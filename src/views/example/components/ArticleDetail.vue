<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules">
      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status">
        <el-select v-model="switchValue" placeholder="跳转方式" style="width:120px">
          <el-option
            v-for="item in switchType"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          发布
        </el-button>
        <el-button v-loading="loading" type="warning" @click="draftForm">
          草稿
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <el-col :span="17">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="title">
                标题
              </MDinput>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="1">
            <el-form-item style="margin-bottom: 40px;">
              <MDinput v-model="postForm.title_short" :maxlength="100" name="title_short">
                副标题
              </MDinput>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label-width="60px" label="站点:" class="postInfo-container-item" required>
              <el-select v-model="postForm.author" default-first-option placeholder="Search Site">
                <el-option v-for="(item,index) in SiteListOptions" :key="item+index" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label-width="60px" label="站点:" class="postInfo-container-item" required>
              <el-select v-model="postForm.author" :remote-method="getRemoteSiteList" filterable default-first-option remote placeholder="Search Site">
                <el-option v-for="(item,index) in SiteListOptions" :key="item+index" :label="item" :value="item" />
              </el-select>
            </el-form-item> -->
          </el-col>
          <el-col :span="10">
            <el-form-item label-width="120px" label="发行时间:" class="postInfo-container-item">
              <el-date-picker v-model="postForm.date" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="选择时间" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="60px" label="概述:">
          <el-input v-model="postForm.content_short" :rows="1" type="textarea" class="article-textarea" autosize placeholder="Please enter the content" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}字</span>
        </el-form-item>

        <el-form-item prop="image_uri" style="margin-bottom: 30px;">
          缩略图:
          <Upload v-model="postForm.image_uri" />
        </el-form-item>

        <el-form-item prop="content" style="margin-bottom: 30px;">
          文章内容
          <Tinymce ref="editor" v-model="postForm.content" :height="400" />
        </el-form-item>

        <div style="min-hright:200px">
          <el-row>
            <el-col :span="12">
              <div class="radio">
                排序：
                <el-radio-group v-model="reverse">
                  <el-radio :label="true">倒序</el-radio>
                  <el-radio :label="false">正序</el-radio>
                </el-radio-group>
                <el-button type="primary" size="mini" style="margin-left:20px" @click="openTLDialogForm()">添加</el-button>
              </div>

              <el-timeline :reverse="reverse">
                <el-timeline-item
                  v-for="(activity, index) in activities"
                  :key="index"
                  :timestamp="activity.timestamp"
                  placement="top"
                  ><el-card class="timeline-card" @click.native="openTLDialogForm(activity)">
                    <h4>{{ activity.h }}</h4>
                    <p>{{ activity.author }} 提交于 {{ activity.timestamp }}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </el-col>
          </el-row>

        </div>

      </div>
    </el-form>

    <el-dialog title="时间线节点" :visible.sync="TLdialogFormVisible">
      <el-form :model="formTL">
        <el-form-item label="活动内容" label-width="120px">
          <el-input v-model="formTL.h" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="TLdialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormStatus === 'create' ? addTimeline() : editTimeLine()">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getDetail,searchSite, submitForm, draftForm } from '@/api/table'
import MDinput from '@/components/MDinput'
import Tinymce from '@/components/Tinymce'
import Upload from '@/components/Upload/WallImage'
import Sticky from '@/components/Sticky'
import { formatTime } from '@/utils/index'

const defaultFormTL = { id: Number(0), h: '', author: '', timestamp: '' } //默认时间线表单
const defaultForm = { //默认表单
  status: 'draft',
  title: '', // 文章题目
  content: '', // 文章内容
  content_short: '', // 文章摘要
  source_uri: '', // 文章外链
  image_uri: '', // 文章图片
  display_time: undefined, // 前台展示时间
  id: undefined,
  platforms: ['a-platform'],
  comment_disabled: false,
  importance: 0,
  author:''
}

export default {
  name: 'ArticleDetail',
  components: { MDinput, Tinymce, Upload, Sticky },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      postForm: Object.assign({}, defaultForm),
      SiteListOptions: [],
      loading: false,
      switchType: [{
        value: 'negivator',
        label: 'negivator'
      }, {
        value: 'switchTab',
        label: 'switchTab'
      }],
      switchValue: '',
      rules: {
        title: [{ required: true, message: '请输入活动名称', trigger: 'blur' }]
      },
      file: null,
      reverse: true,
      activities: [{
        id: 1,
        h: '活动按期开始',
        author: '王小虎',
        timestamp: '2018-04-15'
      }, {
        id: 2,
        h: '通过审核',
        author: '王小虎',
        timestamp: '2018-04-13'
      }, {
        id: 3,
        h: '创建成功',
        author: '王小虎',
        timestamp: '2018-04-11'
      }],
      TLdialogFormVisible: false,
      dialogFormStatus: '',
      formTL: defaultFormTL
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.content_short && this.postForm.content_short.length
    }
  },
  created() {
    if(this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    }
    this.getRemoteSiteList()
  },
  methods: {
    fetchData(id) {
      getDetail(id).then((result) => {
        this.postForm = result.data
      })
    },
    submitForm() {
      this.$refs['postForm'].validate(valid => {
        if (valid) {
          this.loading = true
          const tempData = Object.assign({}, this.postForm, { file: this.file })
          submitForm(tempData).then((data) => {
            this.$notify({
              title: '成功',
              message: '发布文章成功',
              type: 'success',
              duration: 2000
            })
            this.postForm.status = 'published'
            this.loading = false
          })
        } else {
          console.log('验证出错!!')
          return false
        }
      })
    },
    draftForm() {
      this.$refs['postForm'].validate(valid => {
        if(valid) {
          this.loading = true
          const tempData = Object.assign({}, this.postForm, { file: this.file })
          draftForm(tempData).then((data) => {
            this.$notify({
              title: '成功',
              message: '保存文章成功',
              type: 'success',
              duration: 2000
            })
            this.postForm.status = 'published'
            this.loading = false
          })
        } else {
          console.log('验证出错!!')
          return false
        }
      })
    },
    getRemoteSiteList(query) {
      searchSite(query).then(response => {
        // if (!response.data.items) return
        if (!response.data) return
        // this.SiteListOptions = response.data.items.map(v => v.name)
        this.SiteListOptions = response.data
      })
    },
    addTimeline() {
      var formdata = Object.assign({}, this.formTL)
      formdata.id = this.activities.length + 1
      formdata.author = this.$store.state.user.name
      formdata.timestamp = formatTime(new Date(), '{y}-{m}-{d} {h}:{i}')
      this.activities.push(formdata)
      this.TLdialogFormVisible = false
    },
    editTimeLine() {
      var formdata = Object.assign({}, this.formTL)
      formdata.author = this.$store.state.user.name
      formdata.timestamp = formatTime(new Date(), '{y}-{m}-{d} {h}:{i}')
      this.TLdialogFormVisible = false
      this.activities.splice(formdata.id - 1, 1, formdata)
    },
    openTLDialogForm(data) {
      this.formTL = Object.assign({}, data) || defaultFormTL
      this.TLdialogFormVisible = true
      this.dialogFormStatus = data ? 'update' : 'create'
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}

.radio{
  margin-bottom: 20px;
}

.timeline-card{
  cursor: pointer;
}
</style>

